use tauri::{Emitter, Manager};
use tauri_plugin_shell::{ShellExt, process::CommandEvent};

use crate::sidecar_struct::TrainerState;
mod commands;
mod sidecar_struct;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(TrainerState {
            child: Default::default(),
        })
        .setup(|app| {
            let app_handle = app.handle().clone();

            println!("Sidecar inicialization...");
            let sidecar_command = app_handle.shell().sidecar("h55_trainer").unwrap();
            let (mut rx, child) = sidecar_command.spawn().expect("Failed to spawn sidecar");

            let state = app_handle.state::<TrainerState>();
            let child_pid = child.pid();
            *state.child.lock().unwrap() = Some(child);
            println!("child pid: {}", child_pid);

            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line_bytes) => {
                            let line = String::from_utf8_lossy(&line_bytes).trim().to_string();
                            println!("--> Rust odebrał STDOUT: {}", line);
                            app_handle
                                .emit("trainer-message", Some(format!("{}", line)))
                                .unwrap();
                        }
                        CommandEvent::Stderr(error_bytes) => {
                            let error = String::from_utf8_lossy(&error_bytes).trim().to_string();
                            eprintln!("--> Rust ERROR: {}", error);
                            app_handle
                                .emit("trainer-error", Some(format!("{}", error)))
                                .unwrap();
                        }
                        CommandEvent::Terminated(status) => {
                            println!(
                                "--> RUST INFO: Proces C# zakońzcył działanie. Status {:?}",
                                status
                            );
                            break;
                        }
                        _ => {}
                    }
                }
            });
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                let app_handle = window.app_handle();
                let state = app_handle.state::<TrainerState>();
                let mut lock = state.child.lock().unwrap();
                if let Some(child) = lock.take() {
                    println!("Closing C# sidecar...");
                    let _ = child.kill();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![commands::call_sidecar])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

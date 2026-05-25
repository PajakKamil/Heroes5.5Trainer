use crate::sidecar_struct::TrainerState;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
pub async fn call_sidecar(
    state: tauri::State<'_, TrainerState>,
    command: String,
) -> Result<(), String> {
    println!("Siedcar is calling");
    let mut lock = state.child.lock().unwrap();
    if let Some(child) = lock.as_mut() {
        let msg = format!("{}\n", command);
        child.write(msg.as_bytes()).map_err(|e| e.to_string())?;
        println!("Rust wysłała do C#: {}", command);
    } else {
        return Err("Trainer nie jest uruchomiony!".to_string());
    }

    Ok(())
}

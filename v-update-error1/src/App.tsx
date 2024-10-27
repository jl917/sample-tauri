import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

function App() {
  const [updateStatus, setUpdateStatus] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckUpdate = async () => {
    try {
      setIsChecking(true);
      setUpdateStatus("업데이트 확인 중...");

      const result = await invoke("check_update");
      setUpdateStatus(result as string);
    } catch (error) {
      setUpdateStatus(`오류: ${error}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">업데이트 확인</h1>

      <button
        onClick={handleCheckUpdate}
        disabled={isChecking}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        {isChecking ? "확인 중..." : "업데이트 확인"}
      </button>

      {updateStatus && <p className="mt-4">{updateStatus}</p>}
    </div>
  );
}

export default App;

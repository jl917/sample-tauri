// src/App.jsx
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { relaunch } from "@tauri-apps/api/process";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";

const a = async function () {
  try {
    const { shouldUpdate } = await checkUpdate();
    console.log(shouldUpdate);
    return shouldUpdate;
  } catch (error) {
    console.error(error);
  }
  return false;
};

function App() {
  const [currentVersion, setCurrentVersion] = useState<any>("1.0.0");
  const [latestVersion, setLatestVersion] = useState<any>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    a().then((res) => {
      console.log(res);
    });
    // 현재 버전 가져오기
    invoke("get_version").then((version) => {
      setCurrentVersion(version);
    });
  }, []);

  const handleCheckUpdate = async () => {
    try {
      const update = await checkUpdate();
      if (update.shouldUpdate) {
        setLatestVersion(update.manifest?.version);
        setUpdateAvailable(true);
      } else {
        alert("현재 최신 버전입니다.");
      }
    } catch (error) {
      console.error("업데이트 확인 중 오류 발생:", error);
    }
  };

  const handleInstallUpdate = async () => {
    try {
      setUpdating(true);
      // 업데이트 설치
      await installUpdate();
      // 앱 재시작
      await relaunch();
    } catch (error) {
      console.error("업데이트 설치 중 오류 발생:", error);
      setUpdating(false);
    }
  };

  return (
    <div className="container">
      <h1>앱 업데이트 관리자</h1>
      <p>현재 버전: {currentVersion}</p>
      <button onClick={handleCheckUpdate}>업데이트 확인</button>

      {updateAvailable && (
        <div>
          <p>새로운 버전이 있습니다: {latestVersion}</p>
          <button
            onClick={handleInstallUpdate}
            disabled={updating}
          >
            {updating ? "업데이트 설치 중..." : "업데이트 설치하기"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

// src/App.tsx
import { useState, useEffect } from "react";
import { WebviewWindow, getCurrent, Monitor } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import { availableMonitors } from "@tauri-apps/api/window";

function App() {
  const [isExtendedWindowOpen, setIsExtendedWindowOpen] = useState(false);
  const [monitors, setMonitors] = useState<Monitor[]>([]);

  // 모니터 정보 초기 로딩
  useEffect(() => {
    loadMonitors();
  }, []);

  const loadMonitors = async () => {
    try {
      const available = await availableMonitors();
      setMonitors(available);
      console.log("Available monitors:", available);
    } catch (error) {
      console.error("Error loading monitors:", error);
    }
  };

  useEffect(() => {
    const checkWindowStatus = async () => {
      const status = await invoke("monitor_window_status", {
        windowLabel: "extended",
      });
      setIsExtendedWindowOpen(!!status);
    };

    const interval = setInterval(checkWindowStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const openExtendedWindow = async () => {
    try {
      if (monitors.length < 2) {
        alert("두 번째 모니터를 찾을 수 없습니다.");
        return;
      }

      // 현재 창을 가져옴
      const currentWindow = getCurrent();

      // 두 번째 모니터 정보
      const secondDisplay = monitors[1];
      console.log("Second display:", secondDisplay);

      // 기존에 열린 확장 창이 있다면 닫기
      const existingWindow = WebviewWindow.getByLabel("extended");
      if (existingWindow) {
        await existingWindow.close();
      }

      console.log(secondDisplay);
      // 새 창 설정
      const webview = new WebviewWindow("extended", {
        url: "extended.html",
        decorations: false,
        fullscreen: false,
        x: Math.floor(secondDisplay.position.x),
        y: Math.floor(secondDisplay.position.y),
        width: Math.floor(secondDisplay.size.width),
        height: Math.floor(secondDisplay.size.height),
        focus: false,
        skipTaskbar: false,
        alwaysOnTop: true,
      });

      // 디버깅을 위한 이벤트 리스너
      webview.once("tauri://created", async () => {
        console.log("Extended window created");
        setIsExtendedWindowOpen(true);

        // 창이 생성된 후 위치 재설정
        setTimeout(async () => {
          try {
            await webview.setPosition({
              type: "Physical",
              x: Math.floor(secondDisplay.position.x),
              y: Math.floor(secondDisplay.position.y),
            });
            await webview.setFullscreen(true);
          } catch (err) {
            console.error("Error setting window position:", err);
          }
        }, 100);
      });

      webview.once("tauri://close-requested", () => {
        console.log("Extended window closed");
        setIsExtendedWindowOpen(false);
      });

      webview.once("tauri://error", (e) => {
        console.error("Error in extended window:", e);
      });
    } catch (error) {
      console.error("Error opening extended window:", error);
      alert(`확장 화면을 열 수 없습니다: ${error}`);
    }
  };

  const closeExtendedWindow = async () => {
    try {
      const extendedWindow = WebviewWindow.getByLabel("extended");
      if (extendedWindow) {
        await extendedWindow.close();
        setIsExtendedWindowOpen(false);
      }
    } catch (error) {
      console.error("Error closing extended window:", error);
    }
  };

  return (
    <div className="container">
      <h1>메인 화면</h1>
      <button
        onClick={openExtendedWindow}
        disabled={monitors.length < 2 || isExtendedWindowOpen}
      >
        확장 화면 열기 {monitors.length < 2 ? "(모니터 2개 이상 필요)" : ""}
      </button>

      <button
        onClick={closeExtendedWindow}
        disabled={!isExtendedWindowOpen}
      >
        확장 화면 닫기
      </button>
      <div>확장 화면 상태: {isExtendedWindowOpen ? "열림" : "닫힘"}</div>
      <div>감지된 모니터 수: {monitors.length}</div>
    </div>
  );
}

export default App;

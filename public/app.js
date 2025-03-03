document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const logsContainer = document.getElementById("logsContainer");
  const statusDot = document.querySelector(".status-dot");

  socket.on("connect", () => {
    statusDot.classList.add("connected");
  });

  socket.on("disconnect", () => {
    statusDot.classList.remove("connected");
  });

  socket.on("new-log", (log) => {
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";

    logEntry.innerHTML = `
            <div class="log-time">${log.timestamp}</div>
            <div>
                <span class="log-method">${log.method}</span>
                <span class="log-path">${log.path}</span>
            </div>
            <div class="log-details">${log.ip} - ${log.userAgent}</div>
            ${
              log.headers
                ? `<pre class="log-content">Headers: ${JSON.stringify(
                    log.headers,
                    null,
                    2
                  )}
                </pre>`
                : ""
            }
            ${
              log.payload
                ? `<pre class="log-content">Payload: ${JSON.stringify(
                    log.payload,
                    null,
                    2
                  )}</pre>`
                : ""
            }
        `;

    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
  });
});

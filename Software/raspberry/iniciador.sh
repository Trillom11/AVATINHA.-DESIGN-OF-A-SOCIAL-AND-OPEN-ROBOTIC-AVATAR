#!/bin/bash

SESSION_NAME="robot_session"
PYTHON_BIN="/usr/bin/python3"

# --- Pre-flight Checks ---
if ! command -v tmux &> /dev/null; then
    echo "Error: tmux could not be found. Please install it (e.g., sudo apt install tmux)."
    exit 1
fi

# Kill any existing tmux session to ensure a clean start
tmux has-session -t "${SESSION_NAME}" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "Killing existing tmux session: ${SESSION_NAME}"
    tmux kill-session -t "${SESSION_NAME}"
    sleep 1 # Give it a moment to tear down
fi

# Kill any existing pigpiod instance before starting the new session
echo "Attempting to kill any existing pigpiod process..."
sudo killall pigpiod 2>/dev/null
sleep 1 # Give it a moment to stop

echo "Creating new tmux session: ${SESSION_NAME}"

# --- Step 1: Create the new session and its initial window/pane ---
tmux new-session -d -s "${SESSION_NAME}" -n "RobotServices"

# --- Step 2: Create all other panes ---
tmux split-window -h -t "${SESSION_NAME}:0.0"
tmux split-window -v -t "${SESSION_NAME}:0.0"
tmux split-window -v -t "${SESSION_NAME}:0.1"

# --- Step 3: Send commands to each pane explicitly by its index ---

# Pane 0 (Top-Left): cam_webrtc.py
echo "Sending command to Pane 0: cam_webrtc.py"
tmux send-keys -t "${SESSION_NAME}:0.0" "echo 'Starting cam_webrtc.py...'" C-m
tmux send-keys -t "${SESSION_NAME}:0.0" "${PYTHON_BIN} ~/cam_webrtc.py" C-m

# Pane 1 (Top-Right): prueba_sonido_3.py
echo "Sending command to Pane 1: prueba_sonido_3.py"
tmux send-keys -t "${SESSION_NAME}:0.1" "echo 'Starting prueba_sonido_3.py...'" C-m
tmux send-keys -t "${SESSION_NAME}:0.1" "${PYTHON_BIN} ~/prueba_sonido_3.py" C-m

# Pane 2 (Bottom-Left): receiver3.py
echo "Sending command to Pane 2: receiver3.py"
tmux send-keys -t "${SESSION_NAME}:0.2" "echo 'Starting receiver3.py...'" C-m
tmux send-keys -t "${SESSION_NAME}:0.2" "${PYTHON_BIN} ~/receiver3.py" C-m

# Pane 3 (Bottom-Right): flask_5.py with venv activation and pigpiod
echo "Sending command to Pane 3: activating venv, starting pigpiod, then flask_5.py"

# Encapsula toda la lógica en un solo comando multilínea
tmux send-keys -t "${SESSION_NAME}:0.3" "source ~/Desktop/avatinha/bin/activate && \
echo 'Starting pigpiod...' && \
sudo pigpiod && \
while ! pgrep pigpiod > /dev/null; do echo 'Waiting for pigpiod to start...'; sleep 1; done && \
echo 'pigpiod is running. Starting flask_5.py...' && \
python ~/flask_5.py" C-m

echo "All scripts are now running in tmux session '${SESSION_NAME}'."
echo "To attach to the session and see output, run: tmux attach -t ${SESSION_NAME}"
echo "To detach from the session (leave scripts running), press: Ctrl+b d"
echo "To kill the session (stop all scripts), run: tmux kill-session -t ${SESSION_NAME}"
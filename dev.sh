#!/bin/bash

set -e

tmux new-session '(cd frontend && npm start)' \; split-window -v '(cd backend && npm run dev)' \; attach

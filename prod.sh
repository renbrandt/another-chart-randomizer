#!/bin/bash

set -e

(trap 'kill 0' SIGINT; (cd frontend && npm run build-and-serve -- -p 8787) & (cd backend && npm start))

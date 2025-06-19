#!/bin/bash
cd /home/kavia/workspace/code-generation/chessmaster-ai-112651-ad3069b1/chessmaster_ai_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


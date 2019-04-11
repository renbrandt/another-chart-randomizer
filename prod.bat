(
   start "task1" cmd /C "cd frontend & npm run build-and-serve -- -p 8787"
   start "task2" cmd /C "cd backend & npm run start"
) | pause

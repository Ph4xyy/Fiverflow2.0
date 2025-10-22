Write-Host "Fix client_id error applied!" -ForegroundColor Green
Write-Host ""
Write-Host "Changes made:" -ForegroundColor Blue
Write-Host "- Removed client_id column from TaskRow interface" -ForegroundColor Green
Write-Host "- Removed ClientCell component" -ForegroundColor Green
Write-Host "- Removed client column from default columns" -ForegroundColor Green
Write-Host "- Removed clients table queries" -ForegroundColor Green
Write-Host "- Removed ClientLite interface" -ForegroundColor Green
Write-Host ""
Write-Host "Clients are now associated via orders (order_id)" -ForegroundColor Yellow
Write-Host "To test: npm run dev then http://localhost:5173/tasks" -ForegroundColor Yellow
Write-Host ""
Write-Host "The error 'column tasks.client_id does not exist' should be fixed!" -ForegroundColor Green
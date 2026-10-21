$targets = @(
  'https://findmyjob.site/',
  'https://findmyjob.site/jobs',
  'https://findmyjob.site/categories',
  'https://findmyjob.site/about',
  'https://find-my-job-m7x5.onrender.com/api/v1/health',
  'https://find-my-job-m7x5.onrender.com/api/v1/public/jobs?size=6',
  'https://find-my-job-m7x5.onrender.com/api/v1/public/jobs/featured'
)

foreach ($target in $targets) {
  Write-Output "----------------------------------------"
  Write-Output "Testing: $target"
  $times = @()
  $status = 0
  for ($i=1; $i -le 3; $i++) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
      $resp = Invoke-WebRequest -Uri $target -Method Get -TimeoutSec 15 -UseBasicParsing
      $sw.Stop()
      $times += $sw.ElapsedMilliseconds
      $status = $resp.StatusCode
    } catch {
      $sw.Stop()
      $times += $sw.ElapsedMilliseconds
      $status = $_.Exception.Message
    }
  }
  Write-Output "Status: $status"
  Write-Output "Samples (ms): $($times -join ', ')"
}

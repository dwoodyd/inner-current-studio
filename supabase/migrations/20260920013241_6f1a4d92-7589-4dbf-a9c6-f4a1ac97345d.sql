SELECT cron.schedule(
  'purge-internal-logs',
  '17 3 * * *',
  $$
    DELETE FROM cron.job_run_details WHERE end_time < now() - interval '7 days';
    DELETE FROM net._http_response WHERE created < now() - interval '2 days';
  $$
);
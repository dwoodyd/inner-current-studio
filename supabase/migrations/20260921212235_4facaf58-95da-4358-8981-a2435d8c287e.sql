SELECT cron.alter_job(26, command := $cmd$
    DELETE FROM cron.job_run_details WHERE end_time < now() - interval '7 days';
    DELETE FROM net._http_response WHERE created < now() - interval '2 days';
    DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';
  $cmd$);
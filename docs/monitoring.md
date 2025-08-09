# Monitoring

This document describes the CloudWatch setup for CoWorkSpace.

## CloudWatch Alarms
- **CPUUtilization**: alarm when average CPU usage exceeds 70% for 5 minutes.
- **DatabaseConnections**: alarm if RDS connections approach the configured maximum.
- **Latency**: alarm on elevated HTTP latency for the backend.

## Auto Scaling
The Auto Scaling group uses the CPUUtilization alarm to scale:
- **Scale out** when CPU > 70% for 5 minutes.
- **Scale in** when CPU < 30% for 10 minutes.

## Dashboards
CloudWatch dashboards provide graphs for request count, error rates, and resource utilization.

## Logs
Application logs are sent to CloudWatch Logs for centralized retention and analysis.
=======
# Monitoring and Scaling

## Backend Scaling
- Deploy the backend using AWS Elastic Beanstalk or an EC2 Auto Scaling Group.
- Configure scaling policies based on:
  - **CPU Utilization**: scale out when average CPU usage is high and scale in when it drops.
  - **Request Count per Target**: scale out when request rate per instance exceeds the defined threshold.

## CloudWatch Logs and Alarms
- Stream `node server.js` stdout and stderr to **CloudWatch Logs**.
- Create metric filters and alarms for:
  - **High error rate**: trigger when log entries with level `error` exceed a threshold.
  - **High latency**: trigger when application latency exceeds a defined value.

## RDS Monitoring
- Enable **CloudWatch metrics** for the RDS instance.
- Set alarms on key metrics such as:
  - **CPUUtilization**: alarm when CPU usage surpasses the threshold.
  - **DatabaseConnections**: alarm when active connections approach the instance limit.

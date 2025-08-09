# RDS Backup and High Availability

This project uses an AWS RDS PostgreSQL instance. To safeguard data and keep the service available, enable the following features on the database instance:

## Backup strategy
- **Automated backups**: Enable automated backups with a 7-day retention period. This provides point-in-time recovery within the retention window.
- **Manual snapshots**: Create manual snapshots before major changes or releases. Snapshots can be stored indefinitely and used to restore the database or clone environments.
- **Export to S3 (optional)**: Use `aws rds export-task` to export snapshot data to S3 for long-term archival or cross-account storage.

## High availability options
- **Multi-AZ deployment**: Deploy the RDS instance with the Multi-AZ option to maintain a synchronous standby in another Availability Zone. During primary node failure or maintenance, RDS automatically fails over to the standby.
- **Read replicas**: For read-heavy workloads or cross-region redundancy, create read replicas. Promote a replica to primary during a disaster recovery event.
- **Enhanced monitoring**: Enable Amazon CloudWatch and enhanced monitoring to track failover events and database health.

Adjust these settings according to production requirements and cost considerations.

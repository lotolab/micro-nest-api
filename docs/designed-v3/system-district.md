# 通用行政区划


## 表结构

```sql
CREATE TABLE `sys_region` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
  `created_by` int(11) DEFAULT '0' COMMENT 'record created by',
  `updated_by` int(11) DEFAULT '0' COMMENT 'record updated by',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'record create time',
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'record last update time',
  `deleted_at` timestamp(6) NULL DEFAULT NULL COMMENT 'Logic delete sign',
  `pid` int(11) DEFAULT '0' COMMENT 'region parent id',
  `name` varchar(128) NOT NULL COMMENT 'Region Name',
  `code` varchar(20) DEFAULT NULL COMMENT 'code',
  `value` varchar(20) DEFAULT NULL COMMENT 'region ref other value',
  `extra` longtext COMMENT 'extra json string',
  `sortno` int(11) NOT NULL DEFAULT '1' COMMENT 'sort no',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT 'status:0-unavailable,1-available',
  `remark` varchar(255) DEFAULT NULL COMMENT 'description',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
```

## Initial SQL

```sql

```
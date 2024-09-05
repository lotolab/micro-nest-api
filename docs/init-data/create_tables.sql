
-- ---------------------------------------------
-- version 3.0.1 2024-05-28 
-- ADD sys_dict
-- ---------------------------------------------

DROP TABLE IF EXISTS `sys_dict_item`;
DROP TABLE IF EXISTS `sys_dict`;

CREATE TABLE `sys_dict` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Dict name require not null',
  `code` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Dict code require not null',
  `tag` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Dict group',
  `sortno` int(11) DEFAULT '0' COMMENT 'record sort number',
  `icon` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Record icon',
  `status` tinyint(4) DEFAULT '1' COMMENT 'status,0-forbidden,1-normal',
  `remark` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Record remark',
  `created_by` int(11) DEFAULT '0' COMMENT 'record created by',
  `updated_by` int(11) DEFAULT '0' COMMENT 'record updated by',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'record create time',
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'record last update time',
  `deleted_at` timestamp(6) NULL DEFAULT NULL COMMENT 'Logic delete sign',  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_name_code` (`name`,`code`),
  KEY `IDX_sys_dict_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sys_dict_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
  `dict_id` int(11) DEFAULT NULL COMMENT 'Foreign key ID',
  `label` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT 'Select option label',
  `value` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'Select option value ',
  `icon` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Record icon',
  `sortno` bigint(20) DEFAULT '0' COMMENT 'region sortno',
  `status` tinyint(4) DEFAULT '1' COMMENT 'status,0-forbidden,1-normal',
  `extra` longtext COLLATE utf8mb4_unicode_ci COMMENT 'dict item extra json string content',
  `remark` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Record remark',
  `default_actived` tinyint(1) DEFAULT '0' COMMENT 'record is default actived',
  `created_by` int(11) DEFAULT '0' COMMENT 'record created by',
  `updated_by` int(11) DEFAULT '0' COMMENT 'record updated by',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'record create time',
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'record last update time',
  `deleted_at` timestamp(6) NULL DEFAULT NULL COMMENT 'Logic delete sign',  
  PRIMARY KEY (`id`),
  KEY `FK_sys_dict_item_dict_id` (`dict_id`),
  CONSTRAINT `FK_sys_dict_id` FOREIGN KEY (`dict_id`) REFERENCES `sys_dict` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System core dict item';

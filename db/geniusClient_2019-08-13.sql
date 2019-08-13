# ************************************************************
# Sequel Pro SQL dump
# Version 5446
#
# https://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 8.0.16)
# Database: geniusClient
# Generation Time: 2019-08-13 03:52:18 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table bookingList
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bookingList`;

CREATE TABLE `bookingList` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `namaPemilik` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `alamat` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `nomorTelepon` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `tanggalService` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `waktuService` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `merkMobil` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `tipeMobil` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `jenisPerawatan` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `detailPerawatan` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `harga` int(30) NOT NULL,
  `done_flag` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `bookingList` WRITE;
/*!40000 ALTER TABLE `bookingList` DISABLE KEYS */;

INSERT INTO `bookingList` (`id`, `namaPemilik`, `alamat`, `nomorTelepon`, `tanggalService`, `waktuService`, `merkMobil`, `tipeMobil`, `jenisPerawatan`, `detailPerawatan`, `harga`, `done_flag`)
VALUES
	(9,'Muhammad Alkautsar Sanusi','Toddopuli X No 11','01112829758','2019-07-30','11 AM','Toyota','Avanza','Perawatan Khusus','Shock Breaker',1,'Y'),
	(10,'Sadiq Sanusi','Toddopuli X No 11','082194275704','2019-08-01','13 PM','Honda','HR-V','Perawatan Khusus','Servis Berkala',1,'Y'),
	(14,'Test4','Jln Toddopuli X No 11','01112829758','2019-08-15','12 PM','Honda','CR-V','Variasi &#x2F; Aksesoris Tambahan','Cover Jok',1,'Y'),
	(15,'Test5','Jln Toddopuli X No 11','082194275704','2019-08-15','14 PM','Datsun','Go','Variasi &#x2F; Aksesoris Tambahan','Start Engine System',1,'N'),
	(17,'Atuk Dalang','Toddopuli X No 11','082194275704','2019-08-17','12 PM','Datsun','Got','Variasi &#x2F; Aksesoris Tambahan','Cover Jok',1,'N'),
	(18,'Drake Bedenna','Jln Toddopuli X No 11','01112829758','2019-08-17','11 AM','Datsun','Cross','Perawatan Khusus','Ban',1,'N'),
	(19,'Travis Scoot','Toddopuli X No 11','01112829758','2019-08-13','13 PM','Suzuki','Ertiga','Variasi &#x2F; Aksesoris Tambahan','Bumper Clip',1,'N'),
	(21,'Selalu Salah','Toddopuli X No 11','01112829758','2019-08-15','13 PM','Honda','Civic','Perawatan Khusus','Ban',1,'N'),
	(22,'Ebiet G Ade','Toddopuli','082194275704','2019-08-31','12 PM','Nissan','Livina X-Gear','Car Care','Poles Full Body',1,'N'),
	(23,'Travis Scoot','Jln Toddopuli X No 11','082194275704','2019-08-23','13 PM','Suzuki','Ertiga','Perawatan Khusus','Shock Breaker',1,'N');

/*!40000 ALTER TABLE `bookingList` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

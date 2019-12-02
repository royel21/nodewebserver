-- SQLite
-- SELECT Name, REPLACE(Name, '[', '0') as N from Files  where FullPath = 'E:\Temp\Hmangas\yaoi' ORDER by N;

SELECT `Id`, `Name`, `CoverPath`, REPLACE(`Name`, '[', '0') AS `N` FROM `Series` AS `Serie` WHERE `Serie`.`Name` LIKE '%%' ORDER BY `N` LIMIT 0, 27;

 
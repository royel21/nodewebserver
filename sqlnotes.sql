-- SQLite
-- SELECT Name, REPLACE(Name, '[', '0') as N from Files  where FullPath = 'E:\Temp\Hmangas\yaoi' ORDER by N;

--SELECT `Id`, `Name`, `CoverPath`, REPLACE(`Name`, '[', '0') AS `N` FROM `Series` AS `Serie` WHERE `Serie`.`Name` LIKE '%%' ORDER BY `N` LIMIT 0, 27;

--SELECT Name, COUNT(*) FROM files GROUP BY Name HAVING count(*) > 1;

-- SELECT count(*) AS `count` FROM `Files` AS `File` WHERE (`File`.`Name` LIKE '%%' AND File.Id IN (Select FileId from FileCategories where CategoryId = 'nm4pe'));
-- SELECT `Id`, `Name`, `CurrentPos`, `Duration`, `FullPath`, `Type`, `Size`, `CreatedAt`, `DirectoryId`, `FolderId` FROM `Files` AS `File` WHERE (`File`.`Name` LIKE '%%' AND File.Id  IN (Select FileId from 
-- FileCategories where CategoryId = 'nm4pe')) LIMIT 0, 19
SELECT count(*) AS `count` FROM `Files` AS `File` WHERE (`File`.`Name` LIKE '%%' AND File.Id  IN (Select FileId from FileCategories where CategoryId = 'nm4pe'));
Select count(*) as count from Files where Name LIKE '' and Id in(Select FileId from FileCategories where CategoryId = 'nm4pe');

Select Id, Name, NameNormalize
        from Files where Name LIKE '' and Id  in(Select FileId
        from FileCategories where CategoryId = 'nm4pe')
        ORDER BY NameNormalize limit 0, 19;
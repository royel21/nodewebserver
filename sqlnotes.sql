-- SQLite
-- SELECT Name, REPLACE(Name, '[', '0') as N from Files  where FullPath = 'E:\Temp\Hmangas\yaoi' ORDER by N;
--SELECT `Id`, `Name`, `CoverPath`, REPLACE(`Name`, '[', '0') AS `N` FROM `Series` AS `Serie` WHERE `Serie`.`Name` LIKE '%%' ORDER BY `N` LIMIT 0, 27;
--SELECT Name, COUNT(*) FROM files GROUP BY Name HAVING count(*) > 1;
-- SELECT count(*) AS `count` FROM `Files` AS `File` WHERE (`File`.`Name` LIKE '%%' AND File.Id IN (Select FileId from FileCategories where CategoryId = 'nm4pe'));
-- SELECT `Id`, `Name`, `CurrentPos`, `Duration`, `FullPath`, `Type`, `Size`, `CreatedAt`, `DirectoryId`, `FolderId` FROM `Files` AS `File` WHERE (`File`.`Name` LIKE '%%' AND File.Id  IN (Select FileId from
-- FileCategories where CategoryId = 'nm4pe')) LIMIT 0, 19
-- SELECT count(*) AS `count` FROM `Files` AS `File` WHERE (`File`.`Name` LIKE '%%' AND File.Id  IN (Select FileId from FileCategories where CategoryId = 'nm4pe'));
-- Select count(*) as count from Files where Name LIKE '' and Id in(Select FileId from FileCategories where CategoryId = 'nm4pe');
-- Select Id, Name, NameNormalize
--         from Files where Name LIKE '' and Id  in(Select FileId
--         from FileCategories where CategoryId = 'nm4pe')
--         ORDER BY NameNormalize limit 0, 19;
-- SQLite
--DELETE FROM FavoriteFiles where Id > 0;
---DELETE FROM sqlite_sequence WHERE name='FavoriteFiles';
--SELECT (Select FileId from FavoriteFiles where FileId == files.Id) as N, Id, Name, REPLACE(Name, '[', '0') as H  from files ORDER BY H;
--SELECT `Id`, `Name`, `CurrentPos`, `Duration`, `FullPath`, `Type`, `Size`, `CreatedAt`, `DirectoryId`, `FolderId`, REPLACE(`Name`, '[', '0') AS `N`, (Select FileId from FavoriteFiles where FileId == `File`.`Id`) AS `isFav` FROM `Files` AS `File` WHERE `File`.`Name` LIKE '%%' AND `File`.`Type` = 'Manga' ORDER BY `N` LIMIT 0, 27;
-- SELECT Name From Files WHERE (SELECT COUNT(*) from files;
-- DELETE from files where Name in (SELECT Name, COUNT(*) c FROM files GROUP BY Name HAVING c > 1);
--delete   from files where Name not in ( select  min(ROW_NUMBER()) from  files group by Name );
-- SELECT Name, ROW_NUMBER() OVER(Name) as n, COUNT(*) c FROM files GROUP BY Name HAVING c > 1;
SELECT
  `File`.*,
  `Categories`.`Id` AS `Categories.Id`,
  `Categories->FileCategory`.`Id` AS `Categories.FileCategory.Id`,
  `Categories->FileCategory`.`CategoryId` AS `Categories.FileCategory.CategoryId`,
  `Categories->FileCategory`.`FileId` AS `Categories.FileCategory.FileId`
FROM (
    SELECT
      `File`.`Id`,
      `File`.`Name`,
      `File`.`FullPath`,
      `File`.`Type`,
      `File`.`DirectoryId`,
      REPLACE(Name, '[', '0') AS `N`,
      (
        Select
          FileId
        from FavoriteFiles
        where
          FileId == File.Id
          and FavoriteId == 'b1d0p'
      ) AS `isFav`,
      (
        Select
          LastPos
        from RecentFiles
        where
          FileId == File.Id
          and RecentId == 'rsh0o'
      ) AS `CurrentPos`,
      (
        Select
          LastRead
        from RecentFiles
        where
          FileId == File.Id
          and RecentId == 'rsh0o'
      ) AS `LastRead`
    FROM `Files` AS `File`
    WHERE
      `File`.`Name` LIKE '%%'
      AND (
        SELECT
          `FileCategory`.`Id`
        FROM `FileCategories` AS `FileCategory`
        INNER JOIN `Categories` AS `Category` ON `FileCategory`.`CategoryId` = `Category`.`Id`
          AND `Category`.`Id` = 'tna2g'
        WHERE
          (`File`.`Id` = `FileCategory`.`FileId`)
        LIMIT
          1
      ) IS NOT NULL
    ORDER BY
      `N`
    LIMIT
      0, 21
  ) AS `File`
INNER JOIN `FileCategories` AS `Categories->FileCategory` ON `File`.`Id` = `Categories->FileCategory`.`FileId`
INNER JOIN `Categories` AS `Categories` ON `Categories`.`Id` = `Categories->FileCategory`.`CategoryId`
  AND `Categories`.`Id` = 'tna2g'
ORDER BY
  `N`;
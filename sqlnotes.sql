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
  `Recents`.`Id` AS `Recents.Id`,
  `Recents`.`Name` AS `Recents.Name`,
  `Recents`.`UserId` AS `Recents.UserId`,
  `Recents->RecentFiles`.`Id` AS `Recents.RecentFiles.Id`,
  `Recents->RecentFiles`.`LastRead` AS `Recents.RecentFiles.LastRead`,
  `Recents->RecentFiles`.`LastPos` AS `Recents.RecentFiles.LastPos`,
  `Recents->RecentFiles`.`RecentId` AS `Recents.RecentFiles.RecentId`,
  `Recents->RecentFiles`.`FileId` AS `Recents.RecentFiles.FileId`
FROM (
    SELECT
      `File`.`Id`,
      `File`.`Name`,
      `File`.`Duration`,
      `File`.`FullPath`,
      `File`.`Type`,
      `File`.`Size`,
      `File`.`CreatedAt`,
      `File`.`DirectoryId`,
      `File`.`FolderId`,
      `File`.`Id`,
      `File`.`Name`,
      `File`.`DirectoryId`,
      `File`.`Type`,
      `File`.`Duration`
    FROM `Files` AS `File`
    WHERE
      (`File`.`Name` LIKE '%%')
      AND (
        SELECT
          `RecentFiles`.`Id`
        FROM `RecentFiles` AS `RecentFiles`
        INNER JOIN `Recents` AS `Recent` ON `RecentFiles`.`RecentId` = `Recent`.`Id`
          AND `Recent`.`Id` = 'rsh0o'
        WHERE
          (`File`.`Id` = `RecentFiles`.`FileId`)
        LIMIT
          1
      ) IS NOT NULL
    LIMIT
      0, 27
  ) AS `File`
INNER JOIN `RecentFiles` AS `Recents->RecentFiles` ON `File`.`Id` = `Recents->RecentFiles`.`FileId`
INNER JOIN `Recents` AS `Recents` ON `Recents`.`Id` = `Recents->RecentFiles`.`RecentId`
  AND `Recents`.`Id` = 'rsh0o';
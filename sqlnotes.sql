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
      REPLACE(Name, '[', '0') AS `N`,
      (
        Select
          FileId
        from FavoriteFiles
        where
          FileId == File.Id
          and FavoriteId IN (' 0w1sk ')
      ) AS `isFav`,
      (
        Select
          LastPos
        from RecentFiles
        where
          FileId == File.Id
          and RecentId == 'pjwhn'
      ) AS `CurrentPos`,
      (
        Select
          LastRead
        from RecentFiles
        where
          FileId == File.Id
          and RecentId == 'pjwhn'
      ) AS `LastRead`
    FROM `Files` AS `File`
    WHERE
      (`File`.`Name` LIKE '%%')
      AND (
        SELECT
          `RecentFiles`.`Id`
        FROM `RecentFiles` AS `RecentFiles`
        INNER JOIN `Recents` AS `Recent` ON `RecentFiles`.`RecentId` = `Recent`.`Id`
          AND `Recent`.`Id` = 'pjwhn'
        WHERE
          (`File`.`Id` = `RecentFiles`.`FileId`)
        LIMIT
          1
      ) IS NOT NULL
    ORDER BY
      LastRead DESC
    LIMIT
      0, 27
  ) AS `File`
INNER JOIN `RecentFiles` AS `Recents->RecentFiles` ON `File`.`Id` = `Recents->RecentFiles`.`FileId`
INNER JOIN `Recents` AS `Recents` ON `Recents`.`Id` = `Recents->RecentFiles`.`RecentId`
  AND `Recents`.`Id` = 'pjwhn'
ORDER BY
  LastRead DESC;
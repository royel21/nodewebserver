SELECT
  `File`.*,
  `Recents`.`Id` AS `Recents.Id`,
  `Recents`.`Name` AS `Recents.Name`,
  `Recents`.`UserId` AS `Recents.UserId`,
  `Recents->RecentFiles`.`Id` AS `Recents.RecentFiles.Id`,
  `Recents->RecentFiles`.`LastRead` AS `Recents.RecentFiles.LastRead`,
  `Recents->RecentFiles`.`LastPos` AS `Recents.RecentFiles.LastPos`,
  `Recents->RecentFiles`.`RecentId` AS `Recents.RecentFiles.RecentId`,
  `Recents->RecentFiles`.`FileId` AS `Recents.RecentFiles.FileId`,
  `Favorites`.`Id` AS `Favorites.Id`,
  `Favorites`.`Name` AS `Favorites.Name`,
  `Favorites`.`UserId` AS `Favorites.UserId`,
  `Favorites->FavoriteFile`.`Id` AS `Favorites.FavoriteFile.Id`,
  `Favorites->FavoriteFile`.`FavoriteId` AS `Favorites.FavoriteFile.FavoriteId`,
  `Favorites->FavoriteFile`.`FileId` AS `Favorites.FavoriteFile.FileId`
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
      REPLACE(File.Name, '[', '0') AS `N`,
      `Recents->RecentFiles`.`LastRead` AS `LastRead`,
      `Recents->RecentFiles`.`LastPos` AS `CurrentPos`,
      `Favorites`.`UserId` AS `isFav`
    FROM `Files` AS `File`
    WHERE
      (`File`.`Name` LIKE '%%')
      AND (
        SELECT
          `RecentFiles`.`Id`
        FROM `RecentFiles` AS `RecentFiles`
        INNER JOIN `Recents` AS `Recent` ON `RecentFiles`.`RecentId` = `Recent`.`Id`
          AND `Recent`.`Id` = '7z4l9'
        WHERE
          (`File`.`Id` = `RecentFiles`.`FileId`)
        LIMIT
          1
      ) IS NOT NULL
    ORDER BY
      LastRead DESC
    LIMIT
      0, 500
  ) AS `File`
INNER JOIN `RecentFiles` AS `Recents->RecentFiles` ON `File`.`Id` = `Recents->RecentFiles`.`FileId`
INNER JOIN `Recents` AS `Recents` ON `Recents`.`Id` = `Recents->RecentFiles`.`RecentId`
  AND `Recents`.`Id` = '7z4l9'
LEFT OUTER JOIN `FavoriteFiles` AS `Favorites->FavoriteFile` ON `File`.`Id` = `Favorites->FavoriteFile`.`FileId`
LEFT OUTER JOIN `Favorites` AS `Favorites` ON `Favorites`.`Id` = `Favorites->FavoriteFile`.`FavoriteId`;
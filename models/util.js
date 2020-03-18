exports.genCover = item => {
  let cover =
    item.Type === "Folder"
      ? "folders/" + item.Id
      : "files/" + item.Name.replace("#", "%23");
  return `/covers/${cover}.jpg`;
};

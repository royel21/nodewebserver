exports.index = (req, res) => {
    res.render("home/index.pug", { title: "Express Server" });
}

exports.login = (req, res) => {
    res.render("home/login.pug", { title: "Log in", csrfToken: req.csrfToken() });
}

exports.loginPost = (req, res) => {
    res.redirect("/")
}
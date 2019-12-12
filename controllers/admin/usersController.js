let db = require('../../models');

exports.index = (req, res) => {
    res.redirect('/admin/users');
}

exports.users = (req, res) => {
    console.time('admin-user')
    let itemsPerPage = req.params.items || req.query.items || 12;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.params.search || "";

    db.user.findAndCountAll({
        order: ['Role'],
        offset: begin,
        limit: itemsPerPage,
        where: {
            Name: {
                [db.Op.like]: "%" + val + "%"
            }
        }
    }).then(users => {

        var totalPages = Math.ceil(users.count / itemsPerPage);
        let view = req.query.partial ? "admin/users/partial-users-table" : "admin/index";
        res.render(view, {
            title: "Users",
            users,
            pagedatas: {
                currentPage,
                itemsPerPage,
                totalPages,
                search: val,
                action: "/admin/users/",
                csrfToken: req.csrfToken()
            }
        }, (err, html) => {
            if (err) console.log(err);
            if (req.query.partial) {
                res.send({ url: req.url, data: html });

            } else {
                res.send(html);
            }
            console.timeEnd('admin-user')
        });

    }).catch(err => {
        console.log(err);
        res.status(500).send('Internal Server Error');
    });
}

exports.postSearch = (req, res) => {
    let itemsPerPage = req.body.items || 10;
    let currentPage = req.body.page || 1;
    let val = req.body.search || "";
    res.redirect(`/admin/users/${currentPage}/${itemsPerPage}/${val}?partial=true`)
}

exports.user_modal = (req, res) => {

    var uid = req.query.uid;
    db.user.findOne({
        where: {
            Id: uid
        }
    }).then(data => {
        let user = data ? data : {};
        res.render("admin/users/user_form", {
            user: user,
            csrfToken: req.csrfToken(),
            modalTitle: uid ? "Editar usuario" : "Crear Usuario"
        });
    }).catch(err => {
        console.log(err);
        res.status(500).send('Internal Server Error');
    });
}

const createUser = async(req, res) => {

    if (!req.body.username) {
        return res.send({ err: "Nombre no puede estar vacio" });
    } else if (!req.body.password) {
        return res.send({ err: "password no puede estar vacio" })
    }

    let newUser = await db.user.create({
        Name: req.body.username,
        Password: req.body.password,
        Role: req.body.role,
        CreatedAt: new Date()
    })
    if (newUser) {
        console.log(newUser)
        return res.render("admin/users/user-row", { newUser }, (err, html) => {
            if (err) console.log(err);
            res.send({ action: "User", status: "create", Id: newUser.Id, Name: newUser.Name, data: html });
        });
    }
}

const updateUser = async(req, res) => {

    let user_found = await db.user.findOne({ where: { Id: req.body.id } });

    if (user_found) {

        if (req.user.Name === user_found.Name) {
            return res.send({ status: "error", data: "No puede actualizar usuario en uso" });
        }

        let pass = req.body.password === '' ? user_found.Password : req.body.password;

        let updatedUser = await user_found.update({
            Name: req.body.username,
            Role: req.body.role,
            State: req.body.state,
            Password: pass
        });

        if (updateUser) {
            return res.send({ action: "User", status: "update", Id: updatedUser.Id, Name: updatedUser.Name });
        }
    }
    return res.send({ status: "error", data: "Usuario no encontrado" });
}

exports.userModalPost = (req, res) => {
    let result;
    if (req.body.id === '') {
        result = createUser(req, res);
    } else {
        result = updateUser(req, res);
    }
    result.catch(err => {
        console.log(err)
        res.send({ status: "error", data: "Nombre de usuario en uso" });
    });
}

var deleteUser = async(Id, res) => {
    let user = await db.user.findOne({ where: { Id } });
    if (user) {
        await user.destroy();
        return res.send({ status: "Ok", msg: "User Delete Successfull" });
    } else {
        return res.send({ status: "Error", msg: "User Not Found" });
    }
}

exports.delete = (req, res) => {
    if (req.user.Id == req.body.id) {
        res.send({ state: "Error", msg: "Can't Delete User In Use" });
    } else {
        deleteUser(req.body.id, res).catch(err => {
            console.log(err);
            res.send({ status: "Error", msg: "Error Interno del servidor" });
        });
    }
}
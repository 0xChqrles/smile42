var	faceapp = require("faceapp"),
	fs = require("fs"),
	superagent = require("superagent"),
	express = require("express"),
	app = express();

var	REGS = {
	login: /^[a-z -]{3,8}\.jpg$/
}

app.use(express.static("static"))

app.get("/smile/:login", function(req, res) {
	if (!REGS.login.test(req.params.login))
		return (res.send("Invalid login"));
	addSmile(req.params.login).then(function() {
		var img = fs.readFileSync("static/smile/smile_" + req.params.login);
		res.writeHead(200, {"Content-Type": "image/jpeg"});
		res.end(img, "binary");
	}).catch(function(err) {
		res.status(400);
		res.send(errcode);
	});
})

app.use(function(req, res) {
	res.status(404)
	res.send("404");
})

async function	addSmile(login) {
	var	errcode = "Invalid login";
	try {
		if (fs.existsSync("static/smile/smile_" + login)) {
			return ;
		}
		let { body } = await superagent.get("http://cdn.intra.42.fr/users/large_" + login)
		errcode = "Too many requests"
		let final = await faceapp.process(body, "smile")
		errcode = "An error has occured";
		fs.writeFileSync("static/smile/smile_" + login, final);
	} catch (err) {
		throw new Error(errcode);
	}
}

app.listen(8080, function() {
	console.log("localhost:8080 is ready");
});

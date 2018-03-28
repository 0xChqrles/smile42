var	faceapp = require("faceapp"),
	fs = require("fs"),
	superagent = require("superagent"),
	express = require("express"),
	app = express();

var	REGS = {
	login: /^[a-z -]{3,8}\.jpg$/,
	filter: /^(no-filter|smile|smile_2|hot|old|young|female_2|female|male|pan|hitman|hollywood|heisenberg|impression|lion|goatee|hipster|bangs|glasses|wave|makeup)$/
};

app.use(express.static("static"));

app.get("/smile/:login", function(req, res) {
	if (!req.query.filter)
		req.query.filter = "smile";
	if (!REGS.login.test(req.params.login) || !REGS.filter.test(req.query.filter))
		return (res.send("Invalid request"));
	addSmile(req.params.login, req.query.filter).then(function() {
		var img = fs.readFileSync("static/smile/" + req.query.filter + "_" + req.params.login);
		res.writeHead(200, {"Content-Type": "image/jpeg"});
		res.end(img, "binary");
	}).catch(function(err) {
		res.status(400);
		res.send(err);
	});
})

async function	addSmile(login, filter) {
	var	errcode = "Invalid login";
	try {
		if (fs.existsSync("static/smile/" + filter + "_" + login)) {
			return ;
		}
		let { body } = await superagent.get("http://cdn.intra.42.fr/users/large_" + login)
		errcode = "Too many requests"
		let final = await faceapp.process(body, filter)
		errcode = "An error has occured";
		fs.writeFileSync("static/smile/" + filter + "_" + login, final);
	} catch (err) {
		throw (errcode);
	}
}

app.use(function(req, res) {
	res.status(404)
	res.send("404");
})

app.listen(8080, function() {
	console.log("localhost:8080 is ready");
});

var bodyParser 		= require("body-parser"),
	methodOverride  = require("method-override"),
	expressSanitizer= require("express-sanitizer"),
	mongoose   		= require("mongoose"),
	express    		= require("express"),
	app		   		= express();

//APP CONFIG
mongoose.connect("mongodb://localhost:27017/restful_blog_app", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // write only after body-parse
app.use(methodOverride("_method"));

//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title: "Test Blog",
// 	image: "https://images.unsplash.com/1/work-stations-plus-espresso.jpg?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
// 	body: "This is a Blog Post!"
// });

//RESTful ROUTES
app.get("/", function(req, res){
	res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err) {
			console.log("ERROR!");
		} else {
			console.log(typeof blogs);
			console.log(blogs);
			res.render("index", {blogs: blogs});
		}
	});
	
});

//NEW ROUTE
app.get("/blogs/new", function(req, res) {
	res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req, res){
	//create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err) {
			res.render("new");
		} else {
			//then redirect to index
			res.redirect("/blogs");
		}
	});
});


//SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			res.redirect("/blogs");
		} else {
			res.render("edit",{blog: foundBlog});
		}
	});
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(req, res){
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/"+req.params.id);
		}
	});
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res) {
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
	if(err){
	res.redirect("/blogs");
	} else {
	//redirect somewhere
	res.redirect("/blogs");
	}
	});
});

app.listen(3000, function(){
	console.log("Server has started!");
});
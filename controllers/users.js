const User = require("../models/User");

module.exports.renderRegister = (req, res) => {
    // res.send("Register")
    res.render("login");
  }

  module.exports.loginRender = (req, res) => {
    res.render("user/login");
    // res.send("login");
  }

  // module.exports.login=  (req, res) => {
  //   console.log(req.body)
  //     req.flash('success', 'Welcome');
  //     res.redirect('http://viplevel.one/')
  //   }



// @desc Login User
// @route Post /api/vi/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please Input credentials", 400));
  }
  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    next(new ErrorResponse("Email or Password is not valid", 401));
  }

  // check for Password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    next(new ErrorResponse("Email or Password is not valid", 401));
  }
  sendTokenResponse(user, 200, res);
});








  module.exports.logout = (req, res) => {
    req.logout();
    req.flash("success", 'Logged Out Succesfully') 
    res.redirect('/login')
  }
 
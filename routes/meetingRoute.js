const express = require("express");
const router = express.Router();

const meetingController = require("../controllers/meetingController");

router.route("/").post(meetingController.createMeeting);

module.exports = router;

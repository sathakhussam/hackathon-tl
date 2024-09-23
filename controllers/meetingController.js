const Meeting = require("../models/meeting");
const meet = require("../utils/meetingCreator");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const moment = require("moment");

// CREATE
exports.createMeeting = catchAsync(async (req, res, next) => {
  // First getting all the valid students

  //   Adding Time

  let noww = moment();
  let threeHoursFromNow = moment().add(3, "hours");

  let timeDict = {
    start: noww.toISOString(),
    end: threeHoursFromNow.toISOString(),
  };

  //   Now for the meeting name
  const mt = new meet(req.body.attendees, timeDict, `${req.body.name} Lecture`);
  const mtlink = await mt.start();

  res.status(200).json({
    status: "success",
    data: {
      name: `${req.body.name} Lecture`,
      link: mtlink,
      attendees: req.body.attendees,
    },
  });
});

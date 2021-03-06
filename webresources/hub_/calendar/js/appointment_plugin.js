var data = new Data();
var DEFAULT_START_TIME = "8:00 AM";
var DEFAULT_END_TIME = "8:00 PM";
var currentCalendarDate = moment(new Date()).format("YYYY-MM-DD");
var STAFF_EXCEPTION_BG = '#ddd';
var STAFF_EXCEPTION_BORDER = '#ddd';
var messageList = ["Out of office Appointment conflict"];

setTimeout(function () {
    var sylvanAppointment = new SylvanAppointment();
    var locationId = sylvanAppointment.populateLocation(data.getLocation());
    wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
    sylvanAppointment.calendarDate = new Date();
    if (moment(sylvanAppointment.calendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
        wjQuery('.headerDate').addClass('today');
    }
    else {
        wjQuery('.headerDate').removeClass('today');
    }
    function getSunday(d) {
        d = new Date(d);
        var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -7:0); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }

    setTimeout(function () {
        wjQuery(".loc-dropdown .dropdown-menu").on('click', 'li a', function () {
            if (wjQuery(".location-btn").val() != wjQuery(this).attr('value-id')) {
                wjQuery(".location-btn").text(wjQuery(this).text());
                wjQuery(".location-btn").val(wjQuery(this).attr('value-id'));
                locationId = wjQuery(this).attr('value-id');
                return fetchResources(locationId);
            }
        });

        wjQuery('.nextBtn').off('click').on('click', function () {
            //wjQuery(".loading").show();
            if(wjQuery('#dayBtn:checked').val() == 'on'){
                sylvanAppointment.calendarDate = new Date(new Date(sylvanAppointment.calendarDate).setDate(new Date(sylvanAppointment.calendarDate).getDate() + 1));
            }
            else{
                sylvanAppointment.calendarDate = new Date(new Date(sylvanAppointment.calendarDate).setDate(new Date(sylvanAppointment.calendarDate).getDate() + 7));
            }
            wjQuery('.headerDate').text(moment(sylvanAppointment.calendarDate).format('MM/DD/YYYY'));
            if (moment(sylvanAppointment.calendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
                wjQuery('.headerDate').addClass('today');
            }
            else {
                wjQuery('.headerDate').removeClass('today');
            }
            fetchResources(locationId);
        });

        wjQuery('.prevBtn').off('click').on('click', function () {
            //wjQuery(".loading").show();
            if(wjQuery('#dayBtn:checked').val() == 'on'){
                sylvanAppointment.calendarDate = new Date(new Date(sylvanAppointment.calendarDate).setDate(new Date(sylvanAppointment.calendarDate).getDate() - 1));
            }
            else{
                sylvanAppointment.calendarDate = new Date(new Date(sylvanAppointment.calendarDate).setDate(new Date(sylvanAppointment.calendarDate).getDate() - 7));
            }
            wjQuery('.headerDate').text(moment(sylvanAppointment.calendarDate).format('MM/DD/YYYY'));
            if (moment(sylvanAppointment.calendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
                wjQuery('.headerDate').addClass('today');
            }
            else {
                wjQuery('.headerDate').removeClass('today');
            }
            fetchResources(locationId);
        });

        wjQuery('#datepicker').datepicker({
            buttonImage: "/webresources/hub_/calendar/images/calendar.png",
            buttonImageOnly: true,
            changeMonth: true,
            changeYear: true,
            showOn: 'button',
            onSelect: function (date) {
                //wjQuery(".loading").show();
                //sylvanAppointment.clearEvents();
                sylvanAppointment.calendarDate = moment(moment(moment(date).format('MM/DD/YYYY')).format('YYYY-MM-DD')).toDate();
                wjQuery('.headerDate').text(moment(sylvanAppointment.calendarDate).format('MM/DD/YYYY'));
                if (moment(sylvanAppointment.calendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
                    wjQuery('.headerDate').addClass('today');
                }
                else {
                    wjQuery('.headerDate').removeClass('today');
                }
                fetchResources(locationId);
                wjQuery('#datepicker').hide();
            }
        });

        var rtime;
        var timeout = false;
        var delta = 300;
        wjQuery(window).resize(function() {
            rtime = new Date();
            if (timeout === false) {
                timeout = true;
                setTimeout(resizeend, delta);
            }
        });

        function resizeend() {
            if (new Date() - rtime < delta) {
                setTimeout(resizeend, delta);
            } else {
                timeout = false;
                fetchResources(locationId);
            }               
        }

        function fetchResources(locationId) {
            //wjQuery(".loading").show();
            sylvanAppointment.locationId = locationId;
            if(wjQuery('#dayBtn:checked').val() == 'on'){
                sylvanAppointment.startDate =  sylvanAppointment.calendarDate;
                sylvanAppointment.endDate =  sylvanAppointment.calendarDate;
            }
            else{
                sylvanAppointment.startDate =  getSunday(sylvanAppointment.calendarDate);
                sylvanAppointment.endDate =  new Date(new Date(sylvanAppointment.startDate).setDate(new Date(sylvanAppointment.startDate).getDate() + 6));
            }
            var convertedStaffList = sylvanAppointment.formatObjects(data.getAppointmentStaff(locationId,moment(sylvanAppointment.startDate).format('YYYY-MM-DD'),moment(sylvanAppointment.endDate).format('YYYY-MM-DD')), "staffList");
            if(sylvanAppointment.appointment == undefined || sylvanAppointment.appointment.fullCalendar('getView').name == 'resourceDay'){
                sylvanAppointment.populateStaff(convertedStaffList);
            }else{
                sylvanAppointment.staffList = [];
                var firstClm = true;
                for (var i = 0; i < convertedStaffList.length; i++) {
                    if(firstClm){
                        sylvanAppointment.staffList.push({
                            id:"unassignedId",
                            name: "Unassigned",
                        }); 
                        firstClm = false;
                    }
                    sylvanAppointment.staffList.push({
                        name: staffData[i]['_hub_staffid_value@OData.Community.Display.V1.FormattedValue'],
                        id: staffData[i]._hub_staffid_value,
                    });
                }
            }
            if(sylvanAppointment.staffList.length){
                sylvanAppointment.refreshCalendarEvent(locationId, true);
            }else{
                wjQuery(".loading").hide();
            }
        }
        fetchResources(locationId);
    }, 500);        
}, 500);
    

function SylvanAppointment(){
    this.staffList = [];
    this.appointment = undefined;
    this.locationId = "";
    this.filters = [];
    this.appointmentList = [];
    this.eventList = [];
    this.appointmentHours = [];
    this.conflictMsg = ["Out of office appointment conflict","Staff not available conflict"];
    this.appointmentHourException = [];


    this.clearEvents = function () {
        var self = this;
        self.filters = new Object();
        self.eventList = [];
        self.appointmentList = [];
        self.appointmentHours = [];
        self.appointmentHourException = [];
        self.appointment.fullCalendar('removeEvents');
        self.appointment.fullCalendar('removeEventSource');
    }

    this.clearAll = function () {
        var self = this;
        self.filters = new Object();
        self.eventList = [];
        self.staffList = [];
        self.appointmentList = [];
        self.appointmentHours = [];
        self.appointmentHourException = [];
        self.appointment.fullCalendar('removeEvents');
        self.appointment.fullCalendar('removeEventSource');
        self.appointment.fullCalendar('destroy');
    }

    this.getRequiredAttendees = function(id,requiredAttendeesList){
        var attendeList = [];
        if(requiredAttendeesList != undefined){
            for (var i = 0; i < requiredAttendeesList.length; i++) {
                if(requiredAttendeesList[i]['_activityid_value'] == id){
                    var obj = {
                        partyid : requiredAttendeesList[i]['_partyid_value'],
                        partyid_lookuplogicalname : requiredAttendeesList[i]['_partyid_value@Microsoft.Dynamics.CRM.lookuplogicalname'],
                        partyid_formattedValue : requiredAttendeesList[i]['_partyid_value@OData.Community.Display.V1.FormattedValue'],
                        activitypartyid : requiredAttendeesList[i]['activitypartyid'],
                        partyid_associatednavigationproperty : requiredAttendeesList[i]['_partyid_value@Microsoft.Dynamics.CRM.associatednavigationproperty']
                    }
                    attendeList.push(obj);
                }
            }
        }
        return attendeList;
    };

    this.formatObjects = function(args, label){
        args = args == null ? [] : args; 
        var self = this;
        
        var tempList = [];
        if(label == "staffList"){
            tempList = [];
            obj = {
                id:"unassignedId",
                name: "Unassigned",
            };  
            tempList.push(obj);
            wjQuery.each(args, function(index, staffObj) {
                var obj = [];
                obj = {
                    id: staffObj["hub_staffid"],
                    name:staffObj["hub_name"]
                };

                if(staffObj['hub_startdate@OData.Community.Display.V1.FormattedValue'] != undefined){
                    obj['startDate'] = new Date(staffObj['hub_startdate@OData.Community.Display.V1.FormattedValue']);
                }

                if(staffObj['hub_enddate@OData.Community.Display.V1.FormattedValue'] != undefined){
                    obj['endDate'] = new Date(staffObj['hub_enddate@OData.Community.Display.V1.FormattedValue']);
                }else{
                    // add present day as end date
                    obj['endDate'] = undefined ;
                }
                tempList.push(obj);
            });
        }
        else if(label == "appointmentList"){
            tempList = [];
            wjQuery.each(args, function(index, appointmentObj) {
                if(index != 'requiredAttendees'){
                    var startObj = "";
                    var startObj = "";
                    if(appointmentObj['hub_fulldayappointment']){
                        startObj = new Date(appointmentObj['hub_start_date']+" "+DEFAULT_START_TIME);
                        endObj = new Date(appointmentObj['hub_end_date']+" "+DEFAULT_END_TIME);
                    }else{
                        startObj = new Date(appointmentObj['hub_start_date']+" "+appointmentObj['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                        endObj = new Date(appointmentObj['hub_end_date']+" "+appointmentObj['hub_endtime@OData.Community.Display.V1.FormattedValue']);
                    }
                    var obj = {
                        id: appointmentObj['activityid'],
                        type:appointmentObj['hub_type'],
                        typeValue:appointmentObj['hub_type@OData.Community.Display.V1.FormattedValue'],
                        startObj:startObj,
                        endObj:endObj,
                        allDayAppointment : !!appointmentObj['hub_fulldayappointment'],
                        outofoffice : !!appointmentObj['hub_outofofficeappointment'],
                        requiredattendees : self.getRequiredAttendees(appointmentObj['activityid'],args.requiredAttendees),
                        isExceptional : !!appointmentObj['hub_exception'] ,
                        locationId:appointmentObj['_hub_location_value'],
                        diagnosticId : appointmentObj['_hub_diagnosticserviceid_value'],
                        diagnosticName : appointmentObj['_hub_diagnosticserviceid_value@OData.Community.Display.V1.FormattedValue'],
                        status:appointmentObj['hub_appointmentstatus'],
                        pricelistId : appointmentObj['_hub_pricelist_value'],
                        studentId:appointmentObj['_hub_student_value'],
                        studentName:appointmentObj['_hub_student_value@OData.Community.Display.V1.FormattedValue'],
                        parentId:appointmentObj['_regardingobjectid_value'],
                        parentName:appointmentObj['_regardingobjectid_value@OData.Community.Display.V1.FormattedValue'],
                        objOwner:{
                            id:appointmentObj['_ownerid_value'], 
                            entityType:appointmentObj['_ownerid_value@Microsoft.Dynamics.CRM.lookuplogicalname']
                        }
                    };
                    if(appointmentObj['_hub_staff_value'] != undefined){
                        obj.staffId = appointmentObj['_hub_staff_value'];
                        obj.staffValue = appointmentObj['_hub_staff_value@OData.Community.Display.V1.FormattedValue'];
                    }
                    else{
                        obj.staffId = 'unassignedId';
                        obj.staffValue = 'unassignedId'
                    }
                    var index = -1;
                    for (var i = 0; i < tempList.length; i++) {
                        if(tempList[i].id == obj.id){
                            index = i;
                            break;
                        }
                    }
                    if(index == -1)
                        tempList.push(obj);    
                }
            });
        }
        else if(label == "appointmentHours"){
            tempList = [];
            var currentCalendarDate = self.appointment.fullCalendar('getDate');
            wjQuery.each(args, function(index, appointmentHour) {
                var appEffectiveStartDate = appointmentHour['hub_effectivestartdate@OData.Community.Display.V1.FormattedValue'];
                var appEffectiveEndDate,addAppFlag = false;
                if(appointmentHour['hub_effectiveenddate@OData.Community.Display.V1.FormattedValue'] != undefined){
                    appEffectiveEndDate = appointmentHour['hub_effectiveenddate@OData.Community.Display.V1.FormattedValue'];
                }
                else{
                    appEffectiveEndDate = moment(currentCalendarDate).format("MM-DD-YYYY");
                }
                appEffectiveStartDate = new Date(appEffectiveStartDate + ' ' + '00:00').getTime();
                appEffectiveEndDate = new Date(appEffectiveEndDate + ' ' + '23:59').getTime();
                if (currentCalendarDate.getTime() >= appEffectiveStartDate && currentCalendarDate.getTime() <= appEffectiveEndDate) {
                    addAppFlag = true;
                }
                if(addAppFlag && appointmentHour['hub_days'] == self.getDayValue(currentCalendarDate)){
                    var duration = appointmentHour['aworkhours_x002e_hub_duration'];
                    for (var i = appointmentHour['hub_starttime']; i < (appointmentHour['hub_endtime']); i+= duration) {
                        var startObj = new Date(moment(currentCalendarDate).format('MM-DD-YYYY')+" "+self.convertMinsNumToTime(i)); 
                        var endObj = new Date(moment(currentCalendarDate).format('MM-DD-YYYY')+" "+self.convertMinsNumToTime(i+duration)); 
                        tempList.push({
                            appointmentHourId:appointmentHour['hub_timingsid'],
                            type:appointmentHour['aworkhours_x002e_hub_type'],
                            typeValue:appointmentHour['aworkhours_x002e_hub_type@OData.Community.Display.V1.FormattedValue'],
                            startObj:startObj,
                            endObj:endObj,
                            capacity:appointmentHour['hub_capacity'],
                            duration : duration,
                            workHourId:appointmentHour['aworkhours_x002e_hub_workhoursid'],
                            objOwner:{
                                id:appointmentHour['_ownerid_value'], 
                                entityType:appointmentHour['_ownerid_value@Microsoft.Dynamics.CRM.lookuplogicalname']
                            }
                        });
                    }
                }
            });
            this.appointmentHours = tempList;
        }
        else if(label == "staffExceptions"){
            tempList = [];
            this.staffExceptions = [];
            var currentCalendarDate = moment(self.appointment.fullCalendar('getDate')).format("MM-DD-YYYY");
            currentCalendarDate = new Date(currentCalendarDate).setHours(0);
            currentCalendarDate = new Date(new Date(currentCalendarDate).setMinutes(0));
            currentCalendarDate = new Date(new Date(currentCalendarDate).setSeconds(0));
            wjQuery.each(args, function(index, exceptionObj) {
                var obj = {};
                obj.id = exceptionObj['astaff_x002e_hub_staffid'];
                var exceptionStartDate = new Date(exceptionObj['hub_startdate@OData.Community.Display.V1.FormattedValue']);
                // Set time for start date
                exceptionStartDate = new Date(exceptionStartDate).setHours(0);
                exceptionStartDate = new Date(new Date(exceptionStartDate).setMinutes(0));
                exceptionStartDate = new Date(new Date(exceptionStartDate).setSeconds(0));

                var exceptionEndDate = exceptionObj['hub_enddate@OData.Community.Display.V1.FormattedValue'];
                exceptionEndDate = exceptionEndDate == undefined ? exceptionStartDate : new Date(exceptionEndDate);
                // Set time for end date
                exceptionEndDate = new Date(exceptionEndDate).setHours(0);
                exceptionEndDate = new Date(new Date(exceptionEndDate).setMinutes(0));
                exceptionEndDate = new Date(new Date(exceptionEndDate).setSeconds(0));
                if(currentCalendarDate.getTime() >= exceptionStartDate.getTime() && 
                    currentCalendarDate.getTime() <= exceptionEndDate.getTime()){
                    if(exceptionObj['hub_entireday']){
                        obj.startObj = new Date(new Date(currentCalendarDate).setHours(8));
                        obj.endObj = new Date(new Date(currentCalendarDate).setHours(20));
                    }else{
                        obj.startObj = new Date(currentCalendarDate).setHours(exceptionObj["hub_starttime"]/60);
                        obj.startObj = new Date(new Date(obj.startObj).setMinutes(exceptionObj["hub_starttime"]%60));
                        obj.endObj = new Date(currentCalendarDate).setHours(exceptionObj["hub_endtime"]/60);
                        obj.endObj = new Date(new Date(obj.endObj).setMinutes(exceptionObj["hub_endtime"]%60));
                    }
                    tempList.push(obj);
                }
            });
            this.staffExceptions = tempList;
        }else if(label == "staffAvailable"){
            wjQuery.each(args, function(index, staffObj){
                var obj = {
                    id: staffObj["_hub_staffid_value"],
                    name: staffObj["_hub_staffid_value@OData.Community.Display.V1.FormattedValue"],
                    availableDays:[],
                    start:staffObj["hub_startdate@OData.Community.Display.V1.FormattedValue"],
                    end:staffObj["hub_enddate@OData.Community.Display.V1.FormattedValue"]
                }; 
                var allKeys = Object.keys(staffObj);
                wjQuery.each(staffObj, function(k, val){
                    if(typeof(val) == "boolean" && val){
                        var startTime = "";
                        var endTime = "";
                        var backupK = k;
                        if(k == "hub_thursday"){
                            startTime = k.slice(0, 8)+"starttime@OData.Community.Display.V1.FormattedValue";
                            endTime = k.slice(0, 8)+"endtime@OData.Community.Display.V1.FormattedValue";
                        }else{
                            startTime = k.slice(0, 7)+"starttime@OData.Community.Display.V1.FormattedValue";
                            endTime = k.slice(0, 7)+"endtime@OData.Community.Display.V1.FormattedValue";
                        }
                        var pushListKey =  backupK.replace("hub_", "");
                        obj.availableDays[pushListKey] = {startTime:staffObj[startTime], endTime:staffObj[endTime]};
                    }
                });
                tempList.push(obj);
            });
        }
        else if(label == "appointmentException"){
            tempList = [];
            wjQuery.each(args, function(index, appException) {
                appException['hub_date'] = moment(new Date(appException['hub_date'])).format("MM-DD-YYYY");
                var startObj = new Date(appException['hub_date']+" "+self.convertMinsNumToTime(appException['hub_start_time']));
                var endObj = new Date(appException['hub_date']+" "+self.convertMinsNumToTime(appException['hub_end_time']));
                var eventId = appException['aworkhours_x002e_hub_type']+"_"+startObj+"_"+endObj+"_"+"unassignedId";
                var obj = {
                    eventId:eventId,
                    appointmentHourId:appException['hub_timingsid'],
                    id: appException['hub_appointment_slot_exceptionid'],
                    type: appException['aworkhours_x002e_hub_type'],
                    startObj: startObj,
                    endObj: endObj
                } 
                tempList.push(obj);
            });
            this.appointmentHourException = tempList;
        }
        return tempList;
    }

    this.convertMinsNumToTime = function(minsNum){
      if(minsNum){
        // var mins_num = parseFloat(this, 10); // don't forget the second param
        var hours   = Math.floor(minsNum / 60);
        var minutes = Math.floor((minsNum - ((hours * 3600)) / 60));
        var seconds = Math.floor((minsNum * 60) - (hours * 3600) - (minutes * 60));

        // Appends 0 when unit is less than 10
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time = hours+':'+minutes;
        time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
        if (time.length > 1) { 
            time = time.slice (1);  
            time[5] = +time[0] < 12 ? ' AM' : ' PM'; 
            time[0] = +time[0] % 12 || 12; 
        }
        return time.join ('');
      }
    }

    this.getStaffSubjects = function (teacherObj) {
        var subjects = [];
        self = this;
        wjQuery.each(teacherObj, function (k, v) {
            if (k.indexOf("astaff_x002e_hub_") != -1 && typeof (v) == 'boolean' && v == true) {
                value = k.replace("astaff_x002e_hub_", "");
                subjects.push(value.toLowerCase());
            }
        });
        return subjects;
    }

    this.getStaffAvailableDays = function (teacherObj) {
        var avaialbeDaysList = {};
        self = this;
        wjQuery.each(teacherObj, function (k, v) {
            if(k.startsWith("hub_") &&  k.endsWith("day") && typeof (v) == 'boolean' && v == true){
                key = k.replace("hub_", "");
                if(key == "thursday"){
                    startHour = teacherObj["hub_"+key.substring(0, 4)+"starttime"];                    
                    endHour = teacherObj["hub_"+key.substring(0, 4)+"endtime"];                    
                    startTime = teacherObj["hub_"+key.substring(0, 4)+"starttime@OData.Community.Display.V1.FormattedValue"];
                    endTime = teacherObj["hub_"+key.substring(0, 4)+"endtime@OData.Community.Display.V1.FormattedValue"];
                    avaialbeDaysList[key] = {startTime: startTime, endTime: endTime, startHour:startHour, endHour:endHour};
                }else{
                    startHour = teacherObj["hub_"+key.substring(0, 3)+"starttime"];                    
                    endHour = teacherObj["hub_"+key.substring(0, 3)+"endtime"];                    
                    startTime = teacherObj["hub_"+key.substring(0, 3)+"starttime@OData.Community.Display.V1.FormattedValue"];
                    endTime = teacherObj["hub_"+key.substring(0, 3)+"endtime@OData.Community.Display.V1.FormattedValue"];
                    avaialbeDaysList[key] = {startTime: startTime, endTime: endTime, startHour:startHour, endHour:endHour};
                }
            }
        });
        return avaialbeDaysList;
    }

    this.populateLocation = function (args) {
        if (args != null) {
            var locationData = [];
            args[0][0] == undefined ? locationData = args : locationData = args[0];
            var locationList = [];
            for (var i = 0; i < locationData.length; i++) {
                if (!i) {
                    wjQuery(".loc-dropdown .selectedCenter").text(locationData[i].hub_centername);
                    wjQuery(".loc-dropdown .selectedCenter").val(locationData[i].hub_centerid);
                }
                locationList.push('<li><a tabindex="-1" value-id=' + locationData[i].hub_centerid + ' href="javascript:void(0)">' + locationData[i].hub_centername + '</a></li>');
            }
            wjQuery(".loc-dropdown ul").html(locationList);
            return locationData[0].hub_centerid;
        }
    }

    this.dateFromCalendar = function (date, locationId) {
        var self = this;
        var displayDate = new Date(date);
        self.appointment.fullCalendar('gotoDate', displayDate);
        
        var dayOfWeek = moment(date).format('dddd');
        var dayofMonth = moment(date).format('M/D');
        wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);
        self.clearEvents();
        var currentCalendarDate = moment(date).format("YYYY-MM-DD");
        self.refreshCalendarEvent(this.locationId, true);
    }

    this.getDayValue = function (date) {
        if (date != undefined) {
            switch (moment(date).format('dddd').toLowerCase()) {
                case 'monday':
                    return 1;
                    break;
                case 'tuesday':
                    return 2;
                    break;
                case 'wednesday':
                    return 3;
                    break;
                case 'thursday':
                    return 4;
                    break;
                case 'friday':
                    return 5;
                    break;
                case 'saturday':
                    return 6;
                    break;
                case 'sunday':
                    return 7;
                    break;
            }
        }
    }

    this.populateStaff = function (args, isFetch) {
        var self = this;
        if (self.appointment != undefined) {
            self.clearAll();
        }
        if(args.length){
            self.staffList = args;
            self.loadCalendar(self.calendarDate);
        }
    }

    this.loadCalendar = function (args) {
        var self = this;
        // assign filter object to local scope filter to avoid this conflict
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        this.calendarOptions = {
            header: false,
            defaultView: 'resourceDay',
            disableResizing: true,
            defaultEventMinutes : 30,
            minTime: 8,
            maxTime: 20,
            allDayText: '',
            // allDaySlot:false,
            droppable: true,
            onDrag: function(date, allDay, ev, ui, resource){
            self.helperStartTime =  moment(date).format('hh:mm A'); 
            },
            drop: function (date, allDay, ev, ui, resource) {
                self.createEventOnDrop(self, date, allDay, ev, ui, resource, this);
            },
            handleWindowResize: true,
            height: window.innerHeight - 60,
            slotMinutes: 15,
            selectable: false,
            slotEventOverlap: true,
            selectHelper: true,
            select: function (start, end, allDay, event, resourceId) {
                if (title) {
                    this.appointment.fullCalendar('renderEvent',
                    {
                        title: title,
                        start: start,
                        end: end,
                        allDay: allDay,
                        resourceId: resourceId
                    },
                    true // make the event "stick"
                );
                }
                this.appointment.fullCalendar('unselect');
            },
            eventClick: function(calEvent, jsEvent, view) {
                // self.renderWeekModal(calEvent, jsEvent, view);
            },
            editable: false,
            resources: self.staffList,
            events: self.eventList,
            windowResize: function (view) {
                // self.appointment.fullCalendar('option', 'height', window.innerHeight - 60);
            }
        };

        if (args != undefined) {
            this.calendarOptions.year = args.getFullYear();
            this.calendarOptions.month = args.getMonth();
            this.calendarOptions.date = args.getDate();
        }
        self.appointment = wjQuery('#appointment').fullCalendar(this.calendarOptions);
        self.loadMasterInformation();
    }

    this.loadMasterInformation = function () {
        var self = this;
        var checkedList = [];
        var currentCalendarDate = self.appointment.fullCalendar('getDate');
        
        if (wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').length) {
            // wjQuery(".fc-widget-header").css("width", "75px");
            var dayOfWeek = moment(currentCalendarDate).format('dddd');
            var dayofMonth = moment(currentCalendarDate).format('M/D');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').css('text-align', 'center');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);
        }
    }

    this.next = function (locationId) {
        this.appointment.fullCalendar('next');
        var currentCalendarDate = this.appointment.fullCalendar('getDate');
        var currentView = this.appointment.fullCalendar('getView');
        if (currentView.name == 'resourceDay') {
            var dayOfWeek = moment(currentCalendarDate).format('dddd');
            var dayofMonth = moment(currentCalendarDate).format('M/D');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);
        }
        this.clearEvents();
        currentCalendarDate = moment(currentCalendarDate).format("YYYY-MM-DD");
        this.refreshCalendarEvent(this.locationId, true);
    }

    this.prev = function (locationId) {
        this.appointment.fullCalendar('prev');
        var currentCalendarDate = this.appointment.fullCalendar('getDate');
    
        var currentView = this.appointment.fullCalendar('getView');
        if (currentView.name == 'resourceDay') {
            var dayOfWeek = moment(currentCalendarDate).format('dddd');
            var dayofMonth = moment(currentCalendarDate).format('M/D');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);
        }
        this.clearEvents();
        currentCalendarDate = moment(currentCalendarDate).format("YYYY-MM-DD");
        this.refreshCalendarEvent(this.locationId, true);
    }

    this.refreshCalendarEvent = function (locationId, isFetch) {
        var self = this;
        wjQuery('.loading').show();
        setTimeout(function () {
            var currentCalendarDate = self.appointment.fullCalendar('getDate');
            var currentView = self.appointment.fullCalendar('getView');
            // fetch master schedule data based on below flag
            var isFromMasterSchedule = self.findDataSource(currentCalendarDate,currentView);
            if (currentView.name == 'resourceDay') {
                startDate = endDate = moment(currentCalendarDate).format("YYYY-MM-DD");
                self.businessClosure = data.getBusinessClosure(locationId, startDate, endDate) == null ? [] : data.getBusinessClosure(locationId, startDate, endDate);
                if (self.businessClosure == null) {
                    self.businessClosure = [];
                }
                var findingLeaveFlag = true;
                if (self.businessClosure.length) {
                    for (var i = 0; i < self.businessClosure.length; i++) {
                        var businessStartDate = moment(self.businessClosure[i]['hub_startdatetime']).format("MM-DD-YYYY");
                        var businessEndDate = moment(self.businessClosure[i]['hub_enddatetime']).format("MM-DD-YYYY");
                        businessStartDate = new Date(businessStartDate + ' ' + '00:00').getTime();
                        businessEndDate = new Date(businessEndDate + ' ' + '00:00').getTime();
                        var calendarStartDate = new Date(startDate + ' ' + '00:00').getTime();
                        var calendarEndDate = new Date(endDate + ' ' + '00:00').getTime();
                        if (calendarStartDate >= businessStartDate && calendarEndDate <= businessEndDate) {
                            findingLeaveFlag = false;
                        }
                    }
                }
                if (findingLeaveFlag) {
                    wjQuery('table.fc-agenda-slots td div').css('backgroundColor', '');
                    var appointmentHourException = self.formatObjects(data.getappointmentExceptions(locationId,startDate,endDate), "appointmentException");
                    var appointmentHours = data.getAppointmentHours(locationId,startDate,endDate, false);
                    if (appointmentHours == null) {
                        appointmentHours = [];
                    }
                    self.populateAppointmentHours(self.formatObjects(appointmentHours, "appointmentHours"));
                    var staffExceptions = data.getStaffExceptions(locationId,startDate,endDate);
                    if (staffExceptions == null) {
                        staffExceptions = [];
                    }
                    self.populateStaffExceptionAppointment(self.formatObjects(staffExceptions, "staffExceptions"));
                    var appList = data.getAppointment(locationId,moment(self.startDate).format('YYYY-MM-DD'),moment(self.endDate).format('YYYY-MM-DD'));
                    if (appList == null) {
                        appList = [];
                        if(appList.requiredAttendees == null){
                            appList.requiredAttendees = [];
                        }
                    }
                    self.appointmentList = (isFetch || self.appointmentList.length == 0) ? self.formatObjects(appList, "appointmentList") : self.appointmentList;
                    if (self.appointmentList == null) {
                        self.appointmentList = [];
                    }
                    self.populateAppointmentEvent(self.appointmentList);
                }
                else{
                    wjQuery('.loading').hide();
                    wjQuery('table.fc-agenda-slots td div').css('backgroundColor', '#ddd');
                }
            }
        }, 300);
    }

    this.findDataSource = function (currentCalendarDate,view) {
        var now = new Date();
        //constant from instruction view js
        now.setDate(now.getDate() + MASTER_SCHEDULE_CONST);
        if(view.name == 'resourceDay'){
            if (currentCalendarDate > now.getTime()) {
                return true;
            }
            return false;
        }
        else{
            if(view.end.getTime() > now.getTime()){
                return true;
            }
            return false;
        }
    }

    this.createEventOnDrop = function (self, date, allDay, ev, ui, resource, elm) {
        var self = this;
        wjQuery(".loading").show();
        setTimeout(function(){
            var uniqueId = '';
            /*----- uniqIdArry has ----*/
            // 0. type
            // 1. student/parent Id
            // 2. start time
            // 3. end time
            // 4. staff id
            var eventFor = '';
            var activityId = wjQuery(elm).attr("activityid");
            if(elm.hasAttribute("parentid")){
                uniqueId = wjQuery(elm).attr("parentid").split('_');
                eventFor = 'parent';
            }else if(elm.hasAttribute("studentid")){
                uniqueId = wjQuery(elm).attr("studentid").split('_');
                eventFor = 'student';
            }
            var eventColorObj = self.getEventColor(uniqueId[0]);
            var index = self.findUniqueAppointment(uniqueId, activityId);
            if(index != -1){
                var newAppointmentObj = wjQuery.extend(true, {}, self.appointmentList[index]);
                newAppointmentObj['staffId'] = resource.id;
                newAppointmentObj['staffValue'] = resource.name;
                newAppointmentObj['endObj'] = self.findAppointmentDuration(newAppointmentObj['startObj'],newAppointmentObj['endObj'],date);
                newAppointmentObj['startObj'] = date;
                var newEventId = newAppointmentObj['type']+"_"+newAppointmentObj['startObj']+"_"+newAppointmentObj['endObj']+"_"+newAppointmentObj['staffId'];
                var prevEventId = newAppointmentObj['type']+"_"+self.appointmentList[index]['startObj']+"_"+self.appointmentList[index]['endObj']+"_"+self.appointmentList[index]['staffId'];
                if(newEventId != prevEventId){
                    // Check For alert Validation(Not Allowed to drop validation)
                    var isStaffExceptions = self.checkForStaffException(newAppointmentObj);
                    if(isStaffExceptions || isStaffExceptions == 2){
                        self.alertPopup("Staff not available at this time.Please schedule the appointment on a different time.");
                    }else{
                        var prevEvent = self.appointment.fullCalendar('clientEvents',prevEventId);
                        var newEvent = self.appointment.fullCalendar('clientEvents',newEventId);
                        // Check all confirmation meassages here
                        //overlaping Validation Start
                        var isexist = false;
                        var checkEventexit = self.appointment.fullCalendar('clientEvents',function(el){
                            return  el.memberList != undefined && el.memberList.length > 0 && el.id != prevEvent[0].id &&
                                    (
                                        (
                                            newAppointmentObj.start.getTime() <= el.start.getTime() && 
                                            newAppointmentObj.end.getTime() >= el.end.getTime()
                                        ) ||
                                        (
                                            el.start.getTime() <= newAppointmentObj.start.getTime() && 
                                            el.end.getTime() >= newAppointmentObj.end.getTime()
                                        ) ||
                                        (
                                            newAppointmentObj.end.getTime() > el.start.getTime() &&
                                            el.end.getTime() > newAppointmentObj.start.getTime() 
                                        )
                                    )
                        })
                        if (checkEventexit.length) {
                            var eventTypes = self.getEventColor(newAppointmentObj.type);
                            wjQuery.each(checkEventexit, function(k, v) {
                                for (var i = 0; i < v.memberList.length; i++) {
                                    var subEventType = self.getEventColor(v.memberList[i].type);
                                    if(subEventType.display == eventTypes.display){
                                        if (eventTypes.display == 'student') {
                                            isexist = newAppointmentObj.studentId == v.memberList[i].studentId;
                                        }
                                        else{
                                            isexist= newAppointmentObj.parentId == v.memberList[i].parentId;
                                        }
                                        if(isexist){
                                            break;
                                        }
                                    }
                                }
                                if(isexist){
                                    return false;
                                }
                            });                 
                        }
                        if (!isexist) {
                            var errArry = self.checkEventValidation(newEvent, prevEvent, newAppointmentObj, uniqueId);
                            if(errArry.alert.length){
                                var messageString = '';
                                for (var i = 0; i < errArry.alert.length; i++) {
                                    messageString += errArry.alert[i]+", ";
                                }
                                messageString = messageString.substr(0,messageString.length-2);
                                errArry.confirmation = [];
                                self.alertPopup(messageString);
                            }else if(errArry.confirmation.length){
                                var messageString = '';
                                for (var i = 0; i < errArry.confirmation.length; i++) {
                                    messageString += errArry.confirmation[i]+", ";
                                }
                                messageString = messageString.substr(0,messageString.length-2);
                                if(errArry.confirmation.indexOf("Appointment Hour is not available") == -1){
                                    self.confirmPopup(self, date, allDay, ev, ui, resource, elm,messageString+". Do you wish to continue?", false);
                                }else{
                                    self.confirmPopup(self, date, allDay, ev, ui, resource, elm,messageString+". Do you wish to continue?", true);
                                }
                            }else{
                                // Allow to drop event directly
                                self.updateAppointmentOnDrop(self, date, allDay, ev, ui, resource, elm, false);
                            }
                        }else{
                            self.alertPopup("The selected appointment is already scheduled for the respective timeslot.");
                        }
                    }
                }else{
                    wjQuery(".loading").hide();
                } 
            }else{
                wjQuery(".loading").hide();
            }
        }, 300);
    }

    this.checkEventValidation = function(newEvent, prevEvent, newAppointmentObj, uniqueId){
        var self = this;
        var messageObject = {
            alert : [],
            confirmation : [],
        };
        /*----- uniqIdArry has ----*/
            // 0. type
            // 1. student/parent Id
            // 2. start time
            // 3. end time
            // 4. staff id
        // Appointment hour validation
        
        
        //overlaping validation End
        var eventColorObj = self.getEventColor(uniqueId[0]);
        if(eventColorObj.appointmentHour){
            var showPopup = true;
            for (var i = 0; i < self.appointmentHours.length; i++) {
                if(self.appointmentHours[i].type == uniqueId[0]){
                    if(newAppointmentObj['startObj'].getTime() >= self.appointmentHours[i].startObj.getTime() &&
                      newAppointmentObj['startObj'].getTime() <= self.appointmentHours[i].endObj.getTime() &&
                      newAppointmentObj['endObj'].getTime() >= self.appointmentHours[i].startObj.getTime() &&
                      newAppointmentObj['endObj'].getTime() <= self.appointmentHours[i].endObj.getTime()){
                        showPopup = false;
                        break;
                    }
                }
            } 
            if(showPopup){
                if(messageObject.confirmation.indexOf("Appointment Hour is not available") == -1){
                    messageObject.confirmation.push("Appointment Hour is not available");
                }
            }
        }
        
        // End of Appointment hour validation

        // Different type of appointment Validation
        if(newEvent.length == 0){
            var availableEvent = self.appointment.fullCalendar('clientEvents',function(el){
                return  el.type != newAppointmentObj['type'] &&
                        el.resourceId == newAppointmentObj['staffId'] &&
                        (el.start.getTime() == newAppointmentObj['startObj'].getTime() ||
                        el.start.getTime() <= newAppointmentObj['startObj'].getTime() &&
                        newAppointmentObj['startObj'].getTime() < el.end.getTime() )
            });
            if(availableEvent.length){
                if(messageObject.confirmation.indexOf(" Appointment Type is different") == -1){
                    messageObject.confirmation.push(" Appointment Type is different");
                }
            }
        }
        
        // Out Of Office Validation
        // var dropable = self.checkForOutofofficeAppointment(newAppointmentObj);
        var dropableEvent = self.appointment.fullCalendar('clientEvents',function(el){
            return  (el.outOfOffice != undefined && el.outOfOffice) &&
                        el.resourceId == newAppointmentObj.resourceId && 
                    (
                        (
                            newAppointmentObj['startObj'].getTime() <= el.start.getTime() && 
                            newAppointmentObj['endObj'].getTime() >= el.end.getTime()
                        ) ||
                        (
                            el.start.getTime() <= newAppointmentObj['startObj'].getTime() && 
                            el.end.getTime() >= newAppointmentObj['endObj'].getTime()
                        ) ||
                        (
                            newAppointmentObj['endObj'].getTime() > el.start.getTime() &&
                            el.end.getTime() > newAppointmentObj['startObj'].getTime() 
                        )
                    )
        });
        if(dropableEvent.length){
            if(messageObject.confirmation.indexOf(" Appointment Type is Out of office") == -1){
                messageObject.confirmation.push(" Appointment Type is Out of office");
            }
        }

         
        // staff availabilty check 
        if(newAppointmentObj['resourceId'] != "unassignedId"){
            var currentCalendarDate = self.appointment.fullCalendar('getDate');
            startDate = endDate = moment(currentCalendarDate).format("MM-DD-YYYY");
            var dayList = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            var availableStaff = self.formatObjects(data.getStaffAvailable(self.locationId, startDate, endDate), "staffAvailable");
            if(availableStaff.length){
                var availStaff = undefined;
                var counter =1;
                for(var p=0;p<availableStaff.length;p++){
                    var processFlag = false;
                    var startObj = new Date(availableStaff[p].start);
                    if(availableStaff[p].id == newAppointmentObj['resourceId']){
                        if(availableStaff[p].end == undefined){
                           if(startObj.getTime() <= currentCalendarDate.getTime()){
                                availStaff = availableStaff[p];
                                break;
                           }
                        }else{
                           availableStaff[p].end = new Date(availableStaff[p].end); 
                            if(startObj.getTime() <= currentCalendarDate.getTime() && 
                                availableStaff[p].end.getTime() >= currentCalendarDate.getTime()){
                                availStaff = availableStaff[p];
                                break;
                            }
                        }
                    }else{
                        if(counter == availableStaff.length){
                            if(messageObject.confirmation.indexOf(" Staff is not available") == -1){
                                messageObject.confirmation.push(" Staff is not available");
                            }
                        }
                    }
                    counter ++;
                }
                if(availStaff != undefined){
                    var dayString = dayList[currentCalendarDate.getDay()];
                    var availableTimeObj = availStaff.availableDays[dayString];
                    if(availableTimeObj != undefined){
                        if(new Date(startDate+" "+availableTimeObj.startTime).getTime() <= newAppointmentObj['startObj'].getTime() && 
                            newAppointmentObj['startObj'].getTime() <= new Date(startDate+" "+availableTimeObj.endTime).getTime()){
                        }else{
                            if(messageObject.confirmation.indexOf(" Staff is not available") == -1){
                                messageObject.confirmation.push(" Staff is not available");
                            }
                        }
                    }else{
                        if(messageObject.confirmation.indexOf(" Staff is not available") == -1){
                            messageObject.confirmation.push(" Staff is not available");
                        }
                    }
                }
            }
        }

        // Appointment Hour exception validation
        for(var i=0; i<self.staffList.length;i++){
            var isexception = self.appointmentHourException.filter(function(el) {
                return  newAppointmentObj['type'] == el.type &&
                        newAppointmentObj['staffId'] == self.staffList[i]['id'] &&
                        (
                            (
                                newAppointmentObj['startObj'].getTime() <= el.startObj.getTime() && 
                                newAppointmentObj['endObj'].getTime() >= el.endObj.getTime()
                            ) ||
                            (
                                el.startObj.getTime() <= newAppointmentObj['startObj'].getTime() && 
                                el.endObj.getTime() >= newAppointmentObj['endObj'].getTime()
                            ) ||
                            (
                                newAppointmentObj['endObj'].getTime() > el.startObj.getTime() &&
                                el.endObj.getTime() > newAppointmentObj['startObj'].getTime() 
                            )
                        )
            });
            if(isexception.length){
                if(messageObject.alert.indexOf("Appointment can not be placed in an exceptional appointment hour.") == -1){
                    messageObject.alert.push("Appointment can not be placed in an exceptional appointment hour.");
                }
                break;
            }
        }

        if(newEvent.length && prevEvent != undefined){
            if(prevEvent['id'] == newEvent[0]['id']){
                messageObject.alert = [];
                messageObject.confirmation = [];
            }
        }
        return messageObject;
    }


    this.updatePrevEvent = function(prevEvent,element,eventFor, uniqueId, activityId){
        var self = this;
        if (prevEvent.length) {
            var eventTitleHTML = wjQuery(prevEvent[0].title);
            var activityId = wjQuery(element).attr('activityid');
            if(activityId == undefined){
                if(eventFor == 'student'){
                    for (var i = 0; i < eventTitleHTML.length; i++) {
                        if (wjQuery(eventTitleHTML[i]).attr('studentId') == wjQuery(element).attr('studentId')) {
                            eventTitleHTML.splice(i, 1);
                        }
                    }
                }
                else{
                    for (var i = 0; i < eventTitleHTML.length; i++) {
                        if (wjQuery(eventTitleHTML[i]).attr('parentId') == wjQuery(element).attr('parentId')) {
                            eventTitleHTML.splice(i, 1);
                        }
                    }
                }
            }else{
                for (var i = 0; i < eventTitleHTML.length; i++) {
                    if (wjQuery(eventTitleHTML[i]).attr('activityid') == activityId) {
                        eventTitleHTML.splice(i, 1);
                    }
                }
            }
            if (eventTitleHTML.prop('outerHTML') != undefined) {
                if (eventTitleHTML.length == 1) {
                    prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                } else {
                    prevEvent[0].title = "";
                    for (var i = 0; i < eventTitleHTML.length; i++) {
                        prevEvent[0].title += eventTitleHTML[i].outerHTML;
                    }
                }
                
                if ((eventTitleHTML.length == 1 && eventTitleHTML[0].className == "appointmentTitle") || 
                    eventTitleHTML.length == 2 && eventTitleHTML[0].className == "appointmentTitle" && eventTitleHTML[1].className == "conflict" ) {
                    for (var i = 0; i < this.eventList.length; i++) {
                        if (this.eventList[i].id == prevEvent[0].id)
                            this.eventList.splice(i, 1);
                    }
                    this.appointment.fullCalendar('removeEvents', prevEvent[0].id);
                }
                var studentIndex = prevEvent[0].memberList.map(function (x) {
                    return x.id;
                }).indexOf(activityId);
                if(studentIndex != -1){
                    prevEvent[0].memberList.splice(studentIndex, 1);
                    if(prevEvent[0].memberList.length == 0){
                        if(prevEvent[0]["appHourId"] != undefined){
                            var appName = self.getEventColor(prevEvent[0].type).name;
                            prevEvent[0].memberList = [];
                            prevEvent[0].title = prevEvent[0].title.replace('<span class="appointmentTitle">'+appName+'</span>','<span class="appointmentTitle" id="'+prevEvent[0].id+'" appHourId="'+prevEvent[0]["appHourId"]+'" >'+appName+'</span>');
                        }
                    }
                    prevEvent[0].outOfOffice = self.updateOutOfOfficeFlagToEvent(prevEvent[0]);
                    prevEvent = self.addConflictMsg(prevEvent[0]);
                    this.appointment.fullCalendar('updateEvent', prevEvent);
                    this.appointment.fullCalendar('refetchEvents');
                }
                if(prevEvent.capacity != undefined){
                    var newCapacity = 0;
                    var exceptCount = 0;
                    if (eventTitleHTML.length < (prevEvent.capacity+1)) {
                        exceptCount = (prevEvent.capacity+1) - eventTitleHTML.length;
                    }
                    for (var j = 0; j < prevEvent.memberList.length; j++) {
                        if(prevEvent.memberList[j].isExceptional == true){
                            exceptCount+= 1;
                        }
                    }
                    newCapacity= exceptCount;
                    
                    if(eventFor == 'student'){
                        for (var i = 0; i < newCapacity; i++) {
                            prevEvent.title += '<span class="app-placeholder">Student name</span>';
                        }
                    }
                    else if(eventFor == 'parent'){
                        for (var i = 0; i < newCapacity; i++) {
                            prevEvent.title += '<span class="app-placeholder">Customer name</span>';
                        }
                    }
                }
            }else {
                for (var i = 0; i < this.eventList.length; i++) {
                    if (this.eventList[i].id == prevEvent[0].id)
                        this.eventList.splice(i, 1);
                }
                prevEvent[0] = self.addConflictMsg(prevEvent[0]);
                this.appointment.fullCalendar('removeEvents', prevEvent[0]);
                this.appointment.fullCalendar('refetchEvents');
            }
        }
        
        self.draggable('draggable');
        wjQuery(".loading").hide();
    }

    this.updateOutOfOfficeFlagToEvent = function(prevEvent){
        var flag = false;
        if(prevEvent.memberList.length){
            for(var j=0;j<prevEvent.memberList.length;j++){
                if(prevEvent.memberList[j]['outofoffice']){
                    flag = true;
                    break;   
                }
            }
        }
        return flag;
    }

    this.confirmPopup = function (t, date, allDay, ev, ui, resource, elm, message, isexception) {
        var self = this;
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            title:'',
            draggable:false,
            modal: true,
            show: {
                effect: 'bounce',
                complete: function() {
                    wjQuery(".loading").hide();
                }
            },
            buttons: {
                Yes: function () {
                    wjQuery(this).dialog("close");
                    wjQuery(".loading").show();
                    setTimeout(function(){
                        t.updateAppointmentOnDrop(t, date, allDay, ev, ui, resource, elm, isexception);
                        self.draggable('draggable');
                    }, 300);
                },
                No: function () {
                    self.draggable('draggable');
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.alertPopup = function(message){
        var self = this;
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            title:'',
            draggable:false,
            modal: true,
            show: {
                effect: 'bounce',
                complete: function() {
                    wjQuery(".loading").hide();
                }
            },
            buttons: {
                Ok: function () {
                    self.draggable('draggable');
                    wjQuery(this).dialog("close");
                }
            }
        });  
    }

    this.updateAppointmentOnDrop = function(self, date, allDay, ev, ui, resource, elm, isExceptional){
        var uniqueId = '';
        /*----- uniqIdArry has ----*/
        // 0. type
        // 1. student/parent Id
        // 2. start time
        // 3. end time
        // 4. staff id
        var eventFor = '';
        var activityId = wjQuery(elm).attr("activityid");
        if(elm.hasAttribute("parentid")){
            uniqueId = wjQuery(elm).attr("parentid").split('_');
            eventFor = 'parent';
        }else if(elm.hasAttribute("studentid")){
            uniqueId = wjQuery(elm).attr("studentid").split('_');
            eventFor = 'student';
        }
        var index = self.findUniqueAppointment(uniqueId, activityId);
        if(index != -1){
            // if(resource.id != 'unassignedId'){
                var newAppointmentObj = wjQuery.extend(true, {}, self.appointmentList[index]);
                newAppointmentObj['staffId'] = resource.id;
                newAppointmentObj['isExceptional'] = isExceptional;
                newAppointmentObj['staffValue'] = resource.name;
                newAppointmentObj['endObj'] = self.findAppointmentDuration(newAppointmentObj['startObj'],newAppointmentObj['endObj'],date);
                newAppointmentObj['startObj'] = date;
                var newEventId = newAppointmentObj['type']+"_"+newAppointmentObj['startObj']+"_"+newAppointmentObj['endObj']+"_"+newAppointmentObj['staffId'];
                var prevEventId = newAppointmentObj['type']+"_"+self.appointmentList[index]['startObj']+"_"+self.appointmentList[index]['endObj']+"_"+self.appointmentList[index]['staffId'];
                var prevEvent = self.appointment.fullCalendar('clientEvents',prevEventId);
                var newEvent = self.appointment.fullCalendar('clientEvents',newEventId);
                var responseObj = self.saveAppointment(newAppointmentObj, self.appointmentList[index]);
                if (typeof (responseObj) == 'string' && responseObj != "" || typeof (responseObj) == 'boolean' && responseObj) {
                    elm.remove();
                    self.updatePrevEvent(prevEvent,elm,eventFor, uniqueId, activityId);
                    if(responseObj == true){
                        newAppointmentObj['id'] = activityId;
                    }else{
                        newAppointmentObj['id'] = responseObj;
                    }
                    self.populateAppointmentEvent([newAppointmentObj]);
                    this.appointmentList.splice(index,1);
                    this.appointmentList.push(newAppointmentObj);
                }else{
                    wjQuery(".loading").hide();
                }            
        }else{
            wjQuery(".loading").hide();
        }
    }



    this.moveToUnassigned = function(element){
        var self = this;
        var uniqIdArry = [];
        var eventFor = '';
        var uniqueId = "";
        var activityId = wjQuery(element).attr("activityid");
        if(element.hasAttribute("parentid")){
            uniqueId = wjQuery(element).attr("parentid");
            uniqIdArry = uniqueId.split('_');
            eventFor = 'parent';
        }else if(element.hasAttribute("studentid")){
            uniqueId = wjQuery(element).attr("studentid");
            uniqIdArry = uniqueId.split('_');
            eventFor = 'student';
        }
        var eventColorObj = self.getEventColor(uniqIdArry[0]);
        var unassignedEvent = self.appointment.fullCalendar('clientEvents',uniqIdArry[0]+"_"+uniqIdArry[2]+"_"+uniqIdArry[3]+"_unassignedId");
        var allowToDrop = true;
        if(unassignedEvent.length){
            for(var k=0;k<unassignedEvent.length;k++){
                var eachEvent = unassignedEvent[k];
                if(eachEvent.hasOwnProperty("memberList")){
                    for(var ka=0;ka<eachEvent['memberList'].length;ka++){
                        var eachEventMember = eachEvent['memberList'][ka];
                        if(eachEventMember[eventColorObj.display+"Id"] == uniqIdArry[1]){
                            allowToDrop = false;
                            break;
                        }
                    }
                }
                if(!allowToDrop){
                    allowToDrop = false;
                    break;
                }
            }
        }
        if(allowToDrop){
            var uniqIdArry1 = uniqIdArry; 
            var index = self.findUniqueAppointment(uniqIdArry, activityId);
            if(index != -1){
                var newAppointmentObj = wjQuery.extend(true, {}, self.appointmentList[index]);
                newAppointmentObj['staffId'] = "unassignedId";
                newAppointmentObj['resourceId'] = "unassignedId";
                newAppointmentObj['staffValue'] = "Unassigned";
                var prevEventId = self.appointmentList[index]['type']+"_"+self.appointmentList[index]['startObj']+"_"+self.appointmentList[index]['endObj']+"_"+self.appointmentList[index]['staffId'];
                var prevEvent = self.appointment.fullCalendar('clientEvents',prevEventId);
                var errArry = self.checkEventValidation(unassignedEvent, prevEvent, newAppointmentObj, uniqueId);
                if(errArry.alert.length){
                    var messageString = '';
                    for (var i = 0; i < errArry.alert.length; i++) {
                        messageString += errArry.alert[i]+", ";
                    }
                    messageString = messageString.substr(0,messageString.length-2);
                    errArry.confirmation = [];
                    self.alertPopup(messageString);
                }else if(errArry.confirmation.length){
                    var messageString = '';
                    for (var i = 0; i < errArry.confirmation.length; i++) {
                        messageString += errArry.confirmation[i]+", ";
                    }
                    messageString = messageString.substr(0,messageString.length-2);
                    if(errArry.confirmation.indexOf("Appointment Hour is not available") == -1){
                        self.unassignConfirmPopup(element, prevEvent, newAppointmentObj, uniqIdArry, eventFor, activityId, index, messageString+". Do you wish to continue?", false);
                    }else{
                        self.unassignConfirmPopup(element, prevEvent, newAppointmentObj, uniqIdArry, eventFor, activityId, index, messageString+". Do you wish to continue?", true);
                    }
                }else{
                    // Allow to drop event directly
                    self.updateToUnassigned(element, prevEvent, newAppointmentObj, uniqIdArry, eventFor, activityId, index);
                    
                    // element.remove();
                    // var responseObj = data.moveToUnassigned({'activityid': self.appointmentList[index].id});
                    // if(responseObj){
                    //     newAppointmentObj['staffId'] = 'unassignedId';
                    //     newAppointmentObj['staffValue'] = 'unassignedId';
                    //     self.updatePrevEvent(prevEvent,element,eventFor,uniqIdArry, activityId);
                    //     self.populateAppointmentEvent([newAppointmentObj]);
                    //     self.appointmentList.splice(index,1);
                    //     self.appointmentList.push(newAppointmentObj);
                    // }
                }

            }else{
                wjQuery(".loading").hide();
            }
        }else{
            self.alertPopup("Appointment can not be placed in an exceptional appointment hour.");
        }
    }

    this.updateToUnassigned = function(element, prevEvent, newAppointmentObj, uniqIdArry, eventFor, activityId, index){
        var self = this;
        element.remove();
        var responseObj = data.moveToUnassigned({'activityid': newAppointmentObj.id});
        if(responseObj){
            newAppointmentObj['staffId'] = 'unassignedId';
            newAppointmentObj['staffValue'] = 'unassignedId';
            self.updatePrevEvent(prevEvent,element,eventFor,uniqIdArry, activityId);
            self.populateAppointmentEvent([newAppointmentObj]);
            self.appointmentList.splice(index,1);
            self.appointmentList.push(newAppointmentObj);
        }
    }

    this.unassignConfirmPopup = function (element, prevEvent, newAppointmentObj, uniqIdArry, eventFor, activityId, index, message) {
        var self = this;
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            title:'',
            draggable:false,
            modal: true,
            show: {
                effect: 'bounce',
                complete: function() {
                    wjQuery(".loading").hide();
                }
            },
            buttons: {
                Yes: function () {
                    wjQuery(this).dialog("close");
                    wjQuery(".loading").show();
                    setTimeout(function(){
                        self.updateToUnassigned(element, prevEvent, newAppointmentObj, uniqIdArry, eventFor, activityId, index);
                        self.draggable('draggable');
                    }, 300);
                },
                No: function () {
                    self.draggable('draggable');
                    wjQuery(this).dialog("close");
                }
            }
        });
    }


    this.findUniqueAppointment = function(uniqueId, activityId){
        var self = this;
        var index = -1;
        var eventColorObj = self.getEventColor(uniqueId[0]);
        if(activityId != undefined){
            for(var i=0; i< self.appointmentList.length; i++){
                if(activityId == self.appointmentList[i]['id']){
                    index = i;
                    break;
                }
            }
        }else{
            if(eventColorObj.display == 'student'){
                for(var i=0; i< self.appointmentList.length; i++){
                    if(uniqueId[0] == self.appointmentList[i]['type'] &&
                        uniqueId[1] == self.appointmentList[i]["studentId"] && 
                        uniqueId[2] == self.appointmentList[i]['startObj'] &&
                        uniqueId[3] == self.appointmentList[i]['endObj'] &&
                        uniqueId[4] == self.appointmentList[i]['staffId']){
                        index = i;
                        break;
                    }
                }
            }
            else{
                for(var i=0; i< self.appointmentList.length; i++){
                    if(uniqueId[0] == self.appointmentList[i]['type'] &&
                        uniqueId[1] == self.appointmentList[i]["parentId"] && 
                        uniqueId[2] == self.appointmentList[i]['startObj'] &&
                        uniqueId[3] == self.appointmentList[i]['endObj'] &&
                        uniqueId[4] == self.appointmentList[i]['staffId']){
                        index = i;
                        break;
                    }
                }
            }
        }
        return index;
    }

    this.saveAppointment = function(newAppointmentObj,prevAppointmentObj){

        var newAppointment = {};
        var prevAppointment = {};

        newAppointment.activityid = newAppointmentObj.id;
        newAppointment.hub_location = newAppointmentObj.locationId;
        newAppointment.hub_type = newAppointmentObj.type;
        newAppointment.hub_start_date = moment(newAppointmentObj.startObj).format("YYYY-MM-DD");
        newAppointment.hub_end_date = moment(newAppointmentObj.startObj).format("YYYY-MM-DD");
        newAppointment.hub_starttime  = this.convertToMinutes(moment(newAppointmentObj.startObj).format("h:mm A"));
        newAppointment.hub_endtime =  this.convertToMinutes(moment(newAppointmentObj.endObj).format("h:mm A"));
        newAppointment.hub_student = newAppointmentObj.studentId;
        newAppointment.hub_pricelist = newAppointmentObj.pricelistId;
        newAppointment.regardingobjectid = newAppointmentObj.parentId;
        newAppointment.requiredattendees = newAppointmentObj.requiredattendees;
        newAppointment.hub_exception = newAppointmentObj.isExceptional;
        newAppointment.hub_student_name = newAppointmentObj.studentName;
        newAppointment.hub_diagnosticserviceid = newAppointmentObj.diagnosticId;
        newAppointment.hub_diagnosticserviceid_name = newAppointmentObj.diagnosticName;
        newAppointment.hub_outofofficeappointment = newAppointmentObj.outofoffice;
        newAppointment.hub_fulldayappointment = newAppointmentObj.allDayAppointment;
        if(newAppointmentObj.staffId != 'unassignedId')
            newAppointment.hub_staff = newAppointmentObj.staffId;
        
        if(prevAppointmentObj.staffId != 'unassignedId')
            prevAppointment.hub_staff = prevAppointmentObj.staffId;
        
        prevAppointment.activityid = prevAppointmentObj.id;
        prevAppointment.hub_location = prevAppointmentObj.locationId;
        prevAppointment.hub_type = prevAppointmentObj.type;
        prevAppointment.hub_start_date = moment(prevAppointmentObj.startObj).format("YYYY-MM-DD");
        prevAppointment.hub_end_date = moment(prevAppointmentObj.startObj).format("YYYY-MM-DD");
        prevAppointment.hub_starttime  = this.convertToMinutes(moment(prevAppointmentObj.startObj).format("h:mm A"));
        prevAppointment.hub_endtime =  this.convertToMinutes(moment(prevAppointmentObj.endObj).format("h:mm A"));
        prevAppointment.hub_student = prevAppointmentObj.studentId;
        prevAppointment.hub_pricelist = prevAppointmentObj.pricelistId;
        prevAppointment.regardingobjectid = prevAppointmentObj.parentId;
        prevAppointment.requiredattendees = prevAppointmentObj.requiredattendees;
        prevAppointment.hub_exception = prevAppointmentObj.isExceptional;
        prevAppointment.hub_student_name = prevAppointmentObj.studentName;
        prevAppointment.hub_diagnosticserviceid = prevAppointmentObj.diagnosticId;
        prevAppointment.hub_diagnosticserviceid_name = prevAppointmentObj.diagnosticName;
        prevAppointment.hub_outofofficeappointment = prevAppointmentObj.outofoffice;
        prevAppointment.hub_fulldayappointment = prevAppointmentObj.allDayAppointment;
        prevAppointment["objOwner"] = prevAppointmentObj['objOwner'];
        return data.updateAppointment(prevAppointment,newAppointment);
    };

    this.cancelAppointment = function(element){
        var self = this;
        var uniqIdArry = [];
        var eventFor = '';
        var activityId = wjQuery(element).attr("activityid");
        if(element.hasAttribute("parentid")){
            uniqIdArry = wjQuery(element).attr("parentid").split('_');
            eventFor = 'parent';
        }else if(element.hasAttribute("studentid")){
            uniqIdArry = wjQuery(element).attr("studentid").split('_');
            eventFor = 'student';
        }
        var index = self.findUniqueAppointment(uniqIdArry, activityId);
        if(index != -1){
            var responseObj = data.cancelAppointment({'activityid': self.appointmentList[index].id});
            if(responseObj){
                var prevEventId = self.appointmentList[index]['type']+"_"+self.appointmentList[index]['startObj']+"_"+self.appointmentList[index]['endObj']+"_"+self.appointmentList[index]['staffId'];
                var prevEvent = self.appointment.fullCalendar('clientEvents',prevEventId);
                self.updatePrevEvent(prevEvent,element,eventFor,uniqIdArry, activityId);
                self.appointmentList.splice(index,1);
            }
        }
    }

    this.appointmentException = function(selectedOption){
        var self = this;
        var eventId = wjQuery(selectedOption).attr("id"); 
        var appHourId = wjQuery(selectedOption).attr("appHourId");
        if(eventId != undefined){
            /*----- uniqIdArry has ----*/
            // 0. type
            // 1. start time
            // 2. end time
            // 3. staff id
            var uniqIdArry = eventId.split("_");
            var idArry = wjQuery.extend(true, [], uniqIdArry);
            var allowException = true;
            for(var i=0; i<this.staffList.length;i++){
                if(i>0){
                    idArry[3] = this.staffList[i]['id']; 
                    var newEventId = idArry.join("_");
                    var newEvent = self.appointment.fullCalendar('clientEvents', newEventId);
                    if(newEvent.length){
                        allowException = false;
                        break;
                    }
                }
            }
            if(allowException){
                var newDate= moment(new Date(uniqIdArry[1])).format('YYYY-MM-DD');
                var startTime= self.convertToMinutes(moment(new Date(uniqIdArry[1])).format('h:mm A'));
                var endTime= self.convertToMinutes(moment(new Date(uniqIdArry[2])).format('h:mm A'));
                var appointmentHourObj= this.appointmentHours.filter(function (y) {
                    return y.appointmentHourId == appHourId &&
                           y.startObj ==  uniqIdArry[1] &&
                           y.endObj ==  uniqIdArry[2];
                });
                if (appointmentHourObj.length) {
                    appointmentHourObj = appointmentHourObj[0];
                    var response = data.appointmentException(appointmentHourObj['workHourId'], newDate, startTime, endTime, appointmentHourObj['objOwner']);
                    if(response){
                        // self.appointment.fullCalendar('removeEvents', eventId);
                        var appointmentEvent = self.appointment.fullCalendar('clientEvents', eventId);
                        appointmentEvent[0]["backgroundColor"] = STAFF_EXCEPTION_BG;
                        appointmentEvent[0]["borderColor"] = STAFF_EXCEPTION_BORDER;
                        var appHrExp = {};
                        appHrExp['eventId'] = appointmentEvent[0].id;
                        appHrExp['id'] = appointmentEvent[0].appHourId;
                        appHrExp['endObj'] = appointmentEvent[0].end;
                        appHrExp['startObj'] = appointmentEvent[0].start;
                        appHrExp['appointmentHourId'] = undefined;
                        appHrExp['type'] = appointmentEvent[0].type;
                        this.appointmentHourException.push(appHrExp);
                        appointmentEvent[0].title = wjQuery(appointmentEvent[0].title)[0].outerHTML;
                        self.appointment.fullCalendar('updateEvent', appointmentEvent);
                        //self.appointment.fullCalendar('refetchEvents');
                        wjQuery.contextMenu( 'destroy', 'span[id="' + appHrExp['eventId'] + '"]');
                        self.draggable('draggable');
                        wjQuery(".loading").hide();
                    }else{
                        wjQuery(".loading").hide();
                    }
                }
            }else{
                wjQuery(".loading").hide();
                self.alertPopup("Not allowed to create appointment exception.");
            }
        }else{
            self.alertPopup("Not allowed to create appointment exception.");
        }   
    }

    this.convertToMinutes = function (timeString) {
        if (timeString != undefined) {
            if (timeString.split(' ')[1] == 'AM') {
                var hours = parseInt(moment(timeString, 'h:mm A').format('h'));
                var minutes = parseInt(moment(timeString, 'h:mm A').format('mm'));
                return (hours * 60) + minutes;
            }
            else {
                var hours = parseInt(moment(timeString, 'h:mm A').format('h'));
                hours = hours != 12 ? hours + 12 : hours;
                var minutes = parseInt(moment(timeString, 'h:mm A').format('mm'));
                return (hours * 60) + minutes;
            }
        }
    }

    this.findAppointmentDuration = function(start, end, newStart){
        var timeDiff = Math.abs(end.getTime() - start.getTime());
        var diffMins = Math.ceil(timeDiff / (60 * 1000));
        var diffHours = Math.floor(diffMins / 60);
        diffMins %= 60; 
        var newEnd = new Date(newStart);
        newEnd = new Date(newEnd.setHours(newEnd.getHours() + diffHours));
        newEnd = new Date(newEnd.setMinutes(newEnd.getMinutes() + diffMins));
        return newEnd;
    }

    this.getEventColor = function(eventType){
        var eventTypeList = data.getAppointmentType();
        for (var i = 0 ; i < eventTypeList.length; i++) {
            if(eventType == eventTypeList[i]["type"]){
                return eventTypeList[i];
                break;
            }
        }
    }

    this.updateEventObj = function (appointmentObj, populatedEvent){
        var self = this;
        var draggable = true;
        var eventColorObj = self.getEventColor(appointmentObj["type"]);
        if(appointmentObj["outofoffice"]){
            populatedEvent["outOfOffice"] = appointmentObj["outofoffice"];
        }
        var parentId = appointmentObj['type']+"_"+appointmentObj['parentId']+"_"+appointmentObj['startObj']+"_"+appointmentObj['endObj']+"_"+appointmentObj["staffId"];
        var studentId = appointmentObj['type']+"_"+appointmentObj['studentId']+"_"+appointmentObj['startObj']+"_"+appointmentObj['endObj']+"_"+appointmentObj["staffId"];
        if(eventColorObj.appointmentHour && populatedEvent.resourceId == 'unassignedId'){
            populatedEvent.title = "<span class='appointmentTitle'>"+eventColorObj.name+"</span>";
            var exceptionalCount = 0;
            if(appointmentObj['isExceptional']){
                exceptionalCount = 0;
            }
            else{
                exceptionalCount = 1;
            }
            if( eventColorObj.display == "student"){
                if(populatedEvent.memberList){
                    for (var i = 0; i < populatedEvent.memberList.length; i++) {
                        var populatedStudentId = appointmentObj['type']+"_"+populatedEvent.memberList[i]['studentId']+"_"+appointmentObj['startObj']+"_"+appointmentObj['endObj']+"_"+appointmentObj["staffId"];
                        var outOfOfficeClass = (populatedEvent.memberList[i]["outofoffice"]) ? "display-block" : "display-none";
                        if(!populatedEvent.memberList[i].isExceptional){
                            exceptionalCount+=1;
                        }
                        populatedEvent.title += "<span class='draggable drag-student' activityid='"+populatedEvent.memberList[i]['id']+"' studentId='"+populatedStudentId+"' >"+populatedEvent.memberList[i]['studentName']+"<i class='"+outOfOfficeClass+" material-icons tooltip' title='Out of office' >location_on</i></span>";
                    }            

                }
                var outOfOfficeClass = (appointmentObj["outofoffice"]) ? "display-block" : "display-none";
                populatedEvent.title += "<span class='draggable drag-student' activityid='"+appointmentObj['id']+"' studentId='"+studentId+"' >"+appointmentObj['studentName']+"<i class='"+outOfOfficeClass+" material-icons tooltip' title='Out of office' >location_on</i></span>";
                populatedEvent.title += self.addPlaceHolders((populatedEvent.capacity - exceptionalCount),eventColorObj);
                self.addContext(studentId,eventColorObj.display,appointmentObj);
            }else{
                if(populatedEvent.memberList){
                    for (var i = 0; i < populatedEvent.memberList.length; i++) {
                        var populatedParentId = appointmentObj['type']+"_"+populatedEvent.memberList[i]['parentId']+"_"+appointmentObj['startObj']+"_"+appointmentObj['endObj']+"_"+appointmentObj["staffId"];
                        var outOfOfficeClass = (populatedEvent.memberList[i]["outofoffice"]) ? "display-block" : "display-none";
                        if(!populatedEvent.memberList[i].isExceptional){
                            exceptionalCount+=1;
                        }
                        populatedEvent.title += "<span class='draggable drag-parent' activityid='"+populatedEvent.memberList[i]['id']+"' parentId='"+populatedParentId+"' >"+populatedEvent.memberList[i]['parentName']+"<i class='"+outOfOfficeClass+" material-icons tooltip' title='Out of office' >location_on</i></span>";
                    }
                }
                var outOfOfficeClass = (appointmentObj["outofoffice"]) ? "display-block" : "display-none";
                populatedEvent.title += "<span class='draggable drag-parent' activityid='"+appointmentObj['id']+"' parentId='"+parentId+"' >"+appointmentObj['parentName']+"<i class='"+outOfOfficeClass+" material-icons tooltip' title='Out of office' >location_on</i></span>";
                populatedEvent.title += self.addPlaceHolders((populatedEvent.capacity - exceptionalCount),eventColorObj);
                self.addContext(parentId,eventColorObj.display,appointmentObj);
            }
        }else{
            var outOfOfficeClass = (appointmentObj["outofoffice"]) ? "display-block" : "display-none";
            if( eventColorObj.display == "student"){
                populatedEvent.title += "<span class='draggable drag-student' activityid='"+appointmentObj['id']+"' studentId='"+studentId+"' >"+appointmentObj['studentName']+"<i class='"+outOfOfficeClass+" material-icons tooltip' title='Out of office' >location_on</i></span>";
                self.addContext(studentId,eventColorObj.display,appointmentObj);
            }else{
                populatedEvent.title += "<span class='draggable drag-parent' activityid='"+appointmentObj['id']+"' parentId='"+parentId+"' >"+appointmentObj['parentName']+"<i class='"+outOfOfficeClass+" material-icons tooltip' title='Out of office' >location_on</i></span>";
                self.addContext(parentId,eventColorObj.display,appointmentObj);
            }
        }

        populatedEvent.type = appointmentObj['type'];
        populatedEvent.borderColor = eventColorObj.borderColor;
        populatedEvent.backgroundColor = eventColorObj.backgroundColor;
        populatedEvent.dropable = (!appointmentObj["outofoffice"]);
        populatedEvent.memberList.push(appointmentObj);
        populatedEvent = self.addConflictMsg(populatedEvent);
        var eventIndex = -1;
        for(var r=0; r<this.eventList.length;r++){
            if(this.eventList[r].id == populatedEvent.id){
                eventIndex = r;
            }
        }
        if(eventIndex != -1){
            this.eventList[eventIndex] = populatedEvent;
            this.appointment.fullCalendar('updateEvent', populatedEvent);
            this.appointment.fullCalendar( 'refetchEvents');
            self.draggable("draggable");
        }
    } 

    this.addEventObj = function(appointmentObj){
        var self = this;
        var draggable = true;
        var eventColorObj = self.getEventColor(appointmentObj["type"]);
        var outOfOfficeClass = (appointmentObj["outofoffice"]) ? "display-block" : "display-none";
        var eventObj = {
            start:appointmentObj['startObj'],
            end:appointmentObj['endObj'],
            allDay : false,
            type:appointmentObj['type'],
            borderColor:eventColorObj.borderColor,
            color:"#333",
            backgroundColor:eventColorObj.backgroundColor,
            dropable:(!appointmentObj["outofoffice"]),
            memberList : [appointmentObj],
            conflictMsg:[],
            outOfOffice:appointmentObj["outofoffice"],
            resourceId:appointmentObj['staffId']
        }
        eventObj["id"] = appointmentObj["type"]+"_"+appointmentObj['startObj']+"_"+appointmentObj['endObj']+"_"+appointmentObj['staffId'];

        if( eventColorObj.display == "student"){
            var studentId = appointmentObj['type']+"_"+appointmentObj['studentId']+"_"+appointmentObj['startObj']+"_"+appointmentObj['endObj']+"_"+appointmentObj["staffId"];
            eventObj['title'] = "<span class='appointmentTitle'>"+eventColorObj.name+"</span><span class='draggable drag-student' activityid='"+appointmentObj['id']+"' studentId='"+studentId+"' >"+appointmentObj['studentName']+"<i class='"+outOfOfficeClass+" material-icons tooltip' title='Out of office' >location_on</i></span>";
            self.addContext(studentId,eventColorObj.display,appointmentObj);
        }else{
            var parentId = appointmentObj['type']+"_"+appointmentObj['parentId']+"_"+appointmentObj['startObj']+"_"+appointmentObj['endObj']+"_"+appointmentObj["staffId"];
            eventObj['title'] = "<span class='appointmentTitle'>"+eventColorObj.name+"</span><span class='draggable drag-parent' activityid='"+appointmentObj['id']+"' parentId='"+parentId+"' >"+appointmentObj['parentName']+"<i class='"+outOfOfficeClass+" material-icons tooltip' title='Out of office'>location_on</i></span>";
            self.addContext(parentId,eventColorObj.display,appointmentObj);
        }

        eventObj = self.addConflictMsg(eventObj);
        this.eventList.push(eventObj);
        self.appointment.fullCalendar('removeEvents');
        self.appointment.fullCalendar('removeEventSource');
        self.appointment.fullCalendar('addEventSource', { events: this.eventList });
        self.appointment.fullCalendar('refetchEvents');
    }

    this.addConflictMsg = function(eventObj){
        var self = this;
        var msg = "";
        var showConflict = 1;

        // var showConflict = self.checkForOutofofficeAppointment(eventObj);
        // if(showConflict == 2){
        //     var msgIndex = eventObj['conflictMsg'].map(function (x) {
        //         return x;
        //     }).indexOf(1);
        //     if (msgIndex == -1) {
        //         eventObj.conflictMsg.push(1);
        //     }
        // }
        // else if(!showConflict){
        //     var msgIndex = eventObj['conflictMsg'].map(function (x) {
        //         return x;
        //     }).indexOf(0);
        //     if (msgIndex == -1) {
        //         eventObj.conflictMsg.push(0);
        //     }
        // }

        // if(eventObj.conflictMsg!= undefined && eventObj.conflictMsg.length){
        //     wjQuery.each(eventObj.conflictMsg, function (k, v) {
        //         msg += (k + 1) + ". " + self.conflictMsg[v] + "|";
        //     });
        //     var lastIndex = msg.lastIndexOf("|");
        //     msg = msg.substring(0, lastIndex);
        //     // if(eventObj.type != OUT_OF_OFFICE && eventObj.resourceId != "unassignedId"){
        //     if(eventObj.resourceId != "unassignedId"){
        //         if (eventObj.title.indexOf('<img class="conflict" title="' + msg + '" src="/webresources/hub_/calendar/images/warning.png">') == -1) {
        //             eventObj.title += '<img class="conflict" title="' + msg + '" src="/webresources/hub_/calendar/images/warning.png">';
        //         }
        //     }
        // }
        return eventObj;
    }

    this.showTooltip = function () {
      wjQuery(".conflict, .tooltip").tooltip({
            tooltipClass: "custom-conflict",
            track: true,
            content: function () {
                return wjQuery(this).prop('title').replace('|', '<br/>');
            }
        });
    }

    this.populateAppointmentEvent = function(appointmentList){
        var self = this;
        if(appointmentList.length){
            wjQuery.each(appointmentList, function(index, appointmentObj) {
                var eventId = appointmentObj["type"]+"_"+appointmentObj['startObj']+"_"+appointmentObj['endObj']+"_"+appointmentObj['staffId'];
                var populatedEvent = self.appointment.fullCalendar('clientEvents', eventId);
                if(populatedEvent.length){
                    self.updateEventObj(appointmentObj, populatedEvent[0], eventId);
                }else{
                    self.addEventObj(appointmentObj);
                }
            });
            wjQuery('.fc-view-resourceDay .fc-event-time').css('visibility','hidden');
            self.draggable('draggable');
            wjQuery(".loading").hide();
        }else{
            wjQuery(".loading").hide();
        }
    }

    this.populateAppointmentHours = function(appointmentHours){
        var self = this;
        appointmentHours = appointmentHours == null ? [] : appointmentHours;
        if(appointmentHours.length){
            wjQuery.each(appointmentHours, function (index, appointmentHrObj) {
                var eventColorObj = self.getEventColor(appointmentHrObj["type"]);
                var eventId = appointmentHrObj["type"]+"_"+appointmentHrObj['startObj']+"_"+appointmentHrObj['endObj']+"_unassignedId";
                var eventPopulated = self.appointment.fullCalendar('clientEvents', eventId);
                if(eventPopulated.length){
                    eventPopulated[0].capacity += appointmentHrObj['capacity'];
                    eventPopulated[0].title += self.addPlaceHolders(eventPopulated[0].capacity,eventColorObj);
                    var eventIndex = 0;
                    for(var r=0; r<self.eventList.length;r++){
                        if(self.eventList[r].id == eventPopulated.id){
                            eventIndex = r;
                        }
                    }
                    if(eventIndex != -1){
                        self.eventList[eventIndex] = eventPopulated;
                    }
                    self.appointment.fullCalendar('updateEvent', eventPopulated[0]); 
                    self.appointment.fullCalendar( 'refetchEvents');
                }else{
                    var eventObj = {};
                    eventObj = {
                        id:eventId,
                        resourceId:'unassignedId',
                        capacity : appointmentHrObj['capacity'],
                        start:appointmentHrObj['startObj'],
                        end:appointmentHrObj['endObj'],
                        allDay : false,
                        title : "<span class='appointmentTitle' id='"+eventId+"' appHourId='"+appointmentHrObj['appointmentHourId']+"'>"+eventColorObj.name+"</span>",
                        type:appointmentHrObj['type'],
                        // borderColor:eventColorObj.borderColor,
                        color:"#333",
                        dropable:true,
                        conflictMsg:[],
                        // backgroundColor:eventColorObj.backgroundColor,
                        memberList:[],
                        appHourId:appointmentHrObj['appointmentHourId']
                    }
                    // Appointment hour exception validation
                    var isexception = self.appointmentHourException.filter(function(x) {
                       return x.eventId == eventId;
                    });

                    // var isexception = self.appointmentHourException.filter(function(el) {
                    //     return  eventObj['type'] == el.type &&
                    //             eventObj['resourceId'] == "unassignedId" &&
                    //             (
                    //                 (
                    //                     eventObj['start'].getTime() <= el.startObj.getTime() && 
                    //                     eventObj['end'].getTime() >= el.endObj.getTime()
                    //                 ) ||
                    //                 (
                    //                     el.startObj.getTime() <= eventObj['start'].getTime() && 
                    //                     el.endObj.getTime() >= eventObj['end'].getTime()
                    //                 ) ||
                    //                 (
                    //                     eventObj['end'].getTime() > el.startObj.getTime() &&
                    //                     el.endObj.getTime() > eventObj['start'].getTime() 
                    //                 )
                    //             )
                    // });

                    if(isexception.length == 0){
                        if(eventColorObj.appointmentHour){
                            eventObj.title += self.addPlaceHolders(appointmentHrObj['capacity'],eventColorObj);
                        }
                        eventObj['backgroundColor'] = eventColorObj.backgroundColor;
                        eventObj['borderColor'] = eventColorObj.borderColor;
                        self.addContext(eventId,"appointmentHour",appointmentHrObj);
                    }else{
                        eventObj['backgroundColor'] = STAFF_EXCEPTION_BG;
                        eventObj['borderColor'] = STAFF_EXCEPTION_BORDER;
                    }

                    self.eventList.push(eventObj);
                    self.appointment.fullCalendar( 'removeEventSource');
                    self.appointment.fullCalendar( 'removeEvents');
                    self.appointment.fullCalendar( 'addEventSource', self.eventList );
                    self.appointment.fullCalendar( 'refetchEvents');
                }
            });
            this.eventList = self.eventList;
            wjQuery(".loading").hide();
            this.draggable('draggable');
        }
    }

    this.populateStaffExceptionAppointment= function(exceptionList){
        var self = this;
        exceptionList = exceptionList == null ? [] : exceptionList;
        if(exceptionList.length){
            wjQuery.each(exceptionList, function (index, exceptionObj) {
                var eventColorObj = self.getEventColor(OUT_OF_OFFICE);
                var eventId = OUT_OF_OFFICE+"_"+exceptionObj['startObj']+"_"+exceptionObj['endObj']+"_"+ exceptionObj['id'];
                var eventObj = {
                    id:eventId,
                    resourceId: exceptionObj['id'],
                    start:exceptionObj['startObj'],
                    end:exceptionObj['endObj'],
                    allDay : false,
                    title : "<span class='appointmentTitle'>Staff not available</span>",
                    type: OUT_OF_OFFICE,
                    borderColor:STAFF_EXCEPTION_BORDER,
                    color:"#333",
                    dropable:false,
                    conflictMsg:[],
                    backgroundColor:STAFF_EXCEPTION_BG,
                    memberList:[]
                };
                self.eventList.push(eventObj);
                self.appointment.fullCalendar( 'removeEventSource');
                self.appointment.fullCalendar( 'removeEvents');
                self.appointment.fullCalendar( 'addEventSource', self.eventList );
                self.appointment.fullCalendar( 'refetchEvents');
            });
            this.eventList = self.eventList;
            wjQuery(".loading").hide();
        }
    }

    this.addPlaceHolders = function(capacity,eventColorObj){
        var html = '';
        if(capacity){
            if(eventColorObj.display == 'student'){
                for (var i = 0; i < capacity; i++) {
                    html+= '<span class="app-placeholder student-'+eventColorObj.type+'">Student name</span>';
                }
            }
            else if(eventColorObj.display == 'parent'){
                for (var i = 0; i < capacity; i++) {
                    html+= '<span class="app-placeholder customer-'+eventColorObj.type+'">Customer name</span>';
                }
            }
        }
        return html;
    }

    this.eventValidation = function(newObj, prevEvent){
        eventValidation = true;
        return eventValidation;
    }

    this.addContext = function(id,label,appointmentObj){
        var obj= {};
        var self = this;
        if(label == "appointmentHour"){
            obj.appException = {
                name: "Appointment exception",
                callback: function (key, options) {
                    wjQuery(".loading").show();
                    options = wjQuery.extend(true, {}, options);
                    setTimeout(function(){
                        self.appointmentException(options.$trigger[0]);
                    },300);
                }
            }
            wjQuery.contextMenu( 'destroy', 'span[id="' + id + '"]');
            wjQuery.contextMenu({
                selector: 'span[id="' + id + '"]',
                build: function ($trigger, e) {
                  return {
                      items: obj
                  };
                }
            });
        }else{
            var uniqueId = id.split('_');
            /*----- uniqIdArry has ----*/
            // 0. type
            // 1. student/parent Id
            // 2. start time
            // 3. end time
            // 4. staff id
            if(uniqueId[4] != 'unassignedId'){
                obj.moveToUnassigned = {
                    name: "Move to Unassigned",
                    callback: function (key, options) {
                        wjQuery(".loading").show();
                        options = wjQuery.extend(true, {}, options);
                        setTimeout(function(){
                            self.moveToUnassigned(options.$trigger[0]);
                        },300);
                    }
                }
            }
            obj.cancel = {
                name: "Cancel",
                callback: function (key, options) {
                    wjQuery(".loading").show();
                    options = wjQuery.extend(true, {}, options);
                    setTimeout(function(){
                        self.cancelAppointment(options.$trigger[0]);
                    },300);
                }
            }
            if(label == "student"){
                wjQuery.contextMenu( 'destroy', 'span[studentId="' + id + '"]');
                wjQuery.contextMenu({
                    selector: 'span[studentId="' + id + '"]',
                    build: function ($trigger, e) {
                      return {
                          items: obj
                      };
                    }
                });
            }
            else{
                wjQuery.contextMenu( 'destroy', 'span[parentId="' + id + '"]');
                wjQuery.contextMenu({
                    selector: 'span[parentId="' + id + '"]',
                    build: function ($trigger, e) {
                      return {
                          items: obj
                      };
                    }
                });
            }
        }
    }

    this.draggable = function (selector) {
        var self = this;
        wjQuery('.' + selector).draggable({
            revert: true,
            revertDuration: 0,
            appendTo: '#scrollarea',
            helper: "clone",
            cursor: "move",
            scroll: true,
            cursorAt: { top: 0 },
            drag: function () {
                // if (sofExpanded) {
                //     wjQuery('.sof-pane').css('opacity', '.1');
                // }
                // if (taExpanded) {
                //     wjQuery('.ta-pane').css('opacity', '.1');
                // }
            },  
            stop: function () {
                // if (sofExpanded) {
                //     wjQuery('.sof-pane').css('opacity', '1');
                // }
                // if (taExpanded) {
                //     wjQuery('.ta-pane').css('opacity', '1');
                // }
            }
        });
        wjQuery('.' + selector).bind("drag", function(event, ui) {
            var elm = ui.helper;
            setTimeout(function(){
                // console.log(event.currentTarget);
                var name = wjQuery(event.currentTarget).text().replace("location_on","");
                wjQuery(elm).text(name+" (Starting at "+self.helperStartTime+")");
            },30);
        });
        self.showTooltip();
        wjQuery('.drag-student').off('dblclick').on('dblclick',function (e) {
            self.openAppointment(this);    
        });
        wjQuery('.drag-parent').off('dblclick').on('dblclick',function (e) {
            self.openAppointment(this);    
        });
    };

    this.openAppointment = function(element){
        var self = this;
        var activityId = wjQuery(element).attr("activityid");
        if(element.hasAttribute("parentid")){
            uniqueId = wjQuery(element).attr("parentid").split('_');
        }else if(element.hasAttribute("studentid")){
            uniqueId = wjQuery(element).attr("studentid").split('_');
        }
        var index = self.findUniqueAppointment(uniqueId, activityId);
        if (self.appointmentList[index] != undefined) {
            data.openAppointment(self.appointmentList[index].id);
        }
    };

    this.checkForDroppable = function(newEvent) {
        var messageObject = {
            messages : [],
            drop : true
        };
        if(newEvent.length){
            var newEventMembers = newEvent[0].memberList;
            var outofofficeNotDroppable = false;
            var exceptionNotDroppable = false;
            if(newEventMembers.length){
                for (var i = 0; i < newEventMembers.length; i++) {
                    if(newEventMembers[i].outofoffice){
                        outofofficeNotDroppable = true;
                    }
                }
            }
            if(outofofficeNotDroppable){
                messageObject.drop = false;
                messageObject.messages.push('Cannot be place in this Appointment.')
            }
            if(newEvent[0].type == OUT_OF_OFFICE){
                messageObject.drop = false;
                messageObject.messages.push('Cannot be place in the Out of Office Appointment.')
            }
        }
        return messageObject;
    }

    this.checkForStaffException = function(eventObj){
        var self = this;
        if(eventObj.resourceId == undefined){
           eventObj.resourceId =  eventObj.staffId;
        }
        if(eventObj.start == undefined){
           eventObj.start =  eventObj.startObj;
        }
        if(eventObj.end == undefined){
           eventObj.end =  eventObj.endObj;
        }

        var dropableEvent = self.appointment.fullCalendar('clientEvents',function(el){
            return  (el.type == OUT_OF_OFFICE) &&
                    el.resourceId == eventObj.resourceId && 
                    (
                        (
                            eventObj.start.getTime() <= el.start.getTime() && 
                            eventObj.end.getTime() >= el.end.getTime()
                        ) ||
                        (
                            el.start.getTime() <= eventObj.start.getTime() && 
                            el.end.getTime() >= eventObj.end.getTime()
                        ) ||
                        (
                            eventObj.end.getTime() > el.start.getTime() &&
                            el.end.getTime() > eventObj.start.getTime() 
                        )
                    )
        });
        if(dropableEvent.length == 0){
            return false;
            // No Staff Exception case
        }else{
            var staffNotAvailable = false;
            for (var i = 0; i < dropableEvent.length; i++) {
                if(dropableEvent[i].backgroundColor == STAFF_EXCEPTION_BG && dropableEvent[i].borderColor == STAFF_EXCEPTION_BORDER){
                   staffNotAvailable = true;
                   break;
                }
            }
            if(staffNotAvailable){
                return 2;
                // Staff Not available case
            }else{
                return true;
                // Staff Exception case
            }
        }
    }    

    this.checkForOutofofficeAppointment = function(eventObj){
        var self = this;
        if(eventObj.resourceId == undefined){
           eventObj.resourceId =  eventObj.staffId;
        }
        if(eventObj.start == undefined){
           eventObj.start =  eventObj.startObj;
        }
        if(eventObj.end == undefined){
           eventObj.end =  eventObj.endObj;
        }
        var dropableEvent = self.appointment.fullCalendar('clientEvents',function(el){
            return  (el.outOfOffice != undefined && el.outOfOffice) &&
                    el.resourceId == eventObj.resourceId && 
                    (
                        (
                            eventObj.start.getTime() <= el.start.getTime() && 
                            eventObj.end.getTime() >= el.end.getTime()
                        ) ||
                        (
                            el.start.getTime() <= eventObj.start.getTime() && 
                            el.end.getTime() >= eventObj.end.getTime()
                        ) ||
                        (
                            eventObj.end.getTime() > el.start.getTime() &&
                            el.end.getTime() > eventObj.start.getTime() 
                        )
                    )
        });
        if(dropableEvent.length == 0){
            return true;
        }else{
            var staffNotAvailable = false;
            for (var i = 0; i < dropableEvent.length; i++) {
                if(dropableEvent[i].backgroundColor == STAFF_EXCEPTION_BG && dropableEvent[i].borderColor == STAFF_EXCEPTION_BORDER){
                   staffNotAvailable = true;
                   break;
                }
            }
            if(staffNotAvailable){
                return 2;
            }
            return false;
        }
    }

}


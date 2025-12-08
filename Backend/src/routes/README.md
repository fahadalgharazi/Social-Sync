Routes folder holds route definitions
The wires of the app
what routes exist

event.js will have all the routes relevent to events handling
wiring
eventscontroller.js will handle requests and response.
request and response formatting 

services folder will have the files that contain the relevent procession, api calls, database queries...


splitting them like this helps with testing.

for the controller layer we can tests using, requests and responses we make with mock data without calling the ticketmaster api consistnetluy 

can test services with mock data without http and use mock api data.
Template.demo.helpers({
  events () {
    return Events.find({}, {sort: {time:'desc'}, limit: 25})
  }
})

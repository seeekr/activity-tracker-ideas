_ = lodash

// --- this part will have to be reimplemented properly on the server
// --- and just an API should be provided and used on the client (HTTP REST API)
Events = new Meteor.Collection('events')
Meteor.methods({
  save (toSave) {
    toSave.forEach((e) => {
      // TODO do sanity checking?
      // like:
      // - clients could just send us huge amounts of data, so
      //   we need to throttle to max. sane number per interval
      // - discard all if timestamps are not evenly spread out for mousemove
      // - store max ${sane_number} clicks per interval

      Events.insert(e)
    })
  }
})
if (Meteor.isClient) {
  save = function (localEvents) {
    Meteor.call('save', localEvents.splice(0, localEvents.length))
  }
}
// --- /END mock implementation ---

let getDescendentNodeNameSelector = function (target, until) {
  let parentsSel = _.pluck($(target).parentsUntil(until || 'html').get(), 'nodeName').reverse().join('>')
  return parentsSel + (parentsSel ? '>' : '') + target.nodeName
}
let getElementSelector = function (target) {
  if (!_.isEmpty(target.id)) { return '#' + target.id }
  if (!_.isEmpty(target.className)) { return '.' + target.className.split(' ').join('.') }
  let parentsWithId
  if ((parentsWithId = $(target).parents('[id][id!=""]')).length) {
    return '#' + parentsWithId[0].id + ' ' + getDescendentNodeNameSelector(target, parentsWithId[0])
  }
  return getDescendentNodeNameSelector(target)
}

if (Meteor.isClient) {
  let localEvents = []

  function addEvent (e) {
    localEvents.push(_.extend(e, {time: new Date()}))
  }

  setInterval(() => {
    save(localEvents)
  }, 1000)

  $(document).on('mousemove', _.throttle(function (e) {
    addEvent(_.pick(e, 'pageX', 'pageY'))
  }, 250, {leading: true, trailing: true}))

  $(document).click('*', function (e) {
    let evt = _.extend(_.pick(e, 'pageX', 'pageY'), {click: getElementSelector(e.target)})
    addEvent(evt)
  })
}

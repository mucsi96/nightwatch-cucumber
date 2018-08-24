(function () {
  var scrollTimer
  var resizeTimer
  var scrollCache
  var activeElement
  var activationStartTime

  window.addEventListener('load', function () {
    createScrollCache()
    markActiveElement()
  })
  window.addEventListener('scroll', function () {
    if (scrollTimer) {
      clearTimeout(scrollTimer)
    }

    scrollTimer = setTimeout(markActiveElement, 10)
  })
  window.addEventListener('resize', function () {
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }

    resizeTimer = setTimeout(function () {
      createScrollCache()
      markActiveElement()
    }, 10)
  })

  Array.prototype.forEach.call(document.querySelectorAll('a'), function (link) {
    link.addEventListener('click', handleOutboundLinkClicks)
  })

  function createScrollCache () {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    scrollCache = Array.prototype.map.call(document.querySelectorAll('h1[id],h2[id]'), function (element) {
      return { top: scrollTop + element.getBoundingClientRect().top, id: element.id }
    })

    scrollCache.unshift({
      top: 0
    })

    scrollCache.sort(function (elemA, elemB) {
      return elemA.top - elemB.top
    })

    scrollCache = scrollCache.map(function (item, index, items) {
      if (index === items.length - 1) return { bottom: document.documentElement.scrollHeight, id: item.id }
      return { bottom: items[index + 1].top - 1, id: item.id }
    })
  }

  function markActiveElement () {
    if (!scrollCache) return
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    var nextActiveElement
    var readTime
    var item = scrollCache.find(function (item) {
      return item.bottom > scrollTop
    })
    if (item.id) {
      nextActiveElement = document.querySelector('[href="#' + item.id + '"]')
      if (nextActiveElement === activeElement) return
    }
    activeElement && activeElement.classList.remove('active')
    if (nextActiveElement) {
      if (activationStartTime && activeElement) {
        readTime = new Date().getTime() - activationStartTime
        if (readTime > 3000) {
          ga('send', {
            hitType: 'event',
            eventCategory: 'Articles',
            eventAction: 'finish:read',
            eventLabel: activeElement.textContent,
            eventValue: readTime
          })
        }
      }
      activationStartTime = new Date().getTime()
      nextActiveElement.classList.add('active')
      activeElement = nextActiveElement
      var toc = document.querySelector('.table-of-contents ul')
      toc.scrollTop = activeElement.offsetTop - (toc.clientHeight - activeElement.offsetHeight) / 2
    }
  }

  function handleOutboundLinkClicks (event) {
    document.querySelector('#menuToggle input[type="checkbox"]').checked = false
    ga('send', 'event', {
      eventCategory: 'Link',
      eventAction: 'click',
      eventLabel: event.target.href,
      transport: 'beacon'
    })
  }
}())

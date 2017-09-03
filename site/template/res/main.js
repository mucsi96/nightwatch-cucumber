(function () {
  var scrollTimer
  var resizeTimer
  var scrollCache
  var activeElement

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

  function createScrollCache () {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    scrollCache = Array.prototype.map.call(document.querySelectorAll('*[id]'), function (element) {
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
    console.log(scrollCache)
  }

  function markActiveElement () {
    if (!scrollCache) return
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    var nextActiveElement
    var item = scrollCache.find(function (item) {
      return item.bottom > scrollTop
    })
    if (item.id) {
      nextActiveElement = document.querySelector('[href="#' + item.id + '"]')
      if (nextActiveElement === activeElement) return
    }
    activeElement && activeElement.classList.remove('active')
    activeElement = undefined
    if (nextActiveElement) {
      nextActiveElement.classList.add('active')
      activeElement = nextActiveElement
    }
  }
}())

/* global google */
window.drawChart = function (chartData) {
  var chartDataArray = [['Task', 'Cucumber Results']]
  var colors = []

  if (chartData.passed) {
    chartDataArray.push(['Passed', chartData.passed])
    colors.push('#5cb85c')
  }

  if (chartData.failed) {
    chartDataArray.push(['Failed', chartData.failed])
    colors.push('#d9534f')
  }

  if (chartData.notdefined) {
    chartDataArray.push(['Pending', chartData.notdefined])
    colors.push('#5bc0de')
  }
  if (chartData.skipped) {
    chartDataArray.push(['Skipped', chartData.skipped])
    colors.push('#f0ad4e')
  }

  var data = google.visualization.arrayToDataTable(chartDataArray)

  var total = chartData.passed + chartData.failed + (chartData.notdefined || 0) + (chartData.skipped || 0)
  var title

  if (total === 1) {
    title = total + ' ' + chartData.title.slice(0, -1)
  } else {
    title = total + ' ' + chartData.title
  }

  var options = {
    width: '100%',
    height: 240,
    title: title,
    is3D: true,
    colors: colors,
    fontSize: '13',
    fontName: '"Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif',
    slices: {
      1: {offset: 0.4},
      2: {offset: 0.4},
      3: {offset: 0.4}
    },
    titleTextStyle: {
      fontSize: '13',
      color: '#5e5e5e'
    }
  }

  var chart = new google.visualization.PieChart(document.getElementById('piechart_' + chartData.title.toLowerCase()))
  chart.draw(data, options)
}

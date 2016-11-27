var myChart = echarts.init(document.getElementById('main'));
// 显示标题，图例和空的坐标轴
myChart.setOption({
    title: {
        text: 'Targets of Terrorism Attacks'
    },
    tooltip: {},
    legend: {
        data:['targtype1_txt']
    },
    xAxis: {
        data: []
    },
    yAxis: {},
    series: [{
        name: 'targtype1_txt',
        type: 'bar',
        data: []
    }]

    // 异步加载数据
    $.get('terrorism_data.csv').done(function (data) {
    // 填入数据
    myChart.setOption({
        xAxis: {
            data: data.categories
        },
        series: [{
            // 根据名字对应到相应的系列
            name: 'targtype1_txt',
            data: data.data
        }]
    });
});

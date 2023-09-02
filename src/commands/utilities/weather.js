const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const weatherKey = process.env.WEATHER_TOKEN;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Get the weather of a location')
        .addStringOption(options =>
            options.setName('location')
            .setDescription('Type the city/area name or zip code')
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(50))
        .setDMPermission(false),
    async execute(interaction) {
        const location = interaction.options.getString('location')
        let geoData = undefined
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${weatherKey}`
        await interaction.deferReply()
        console.log(`Getting the weather information for ${location} in the server ${interaction.guild.name}`)

        try {
            const geoFetch = await fetch(geoUrl)
            if(!geoFetch.ok){
                throw new Error(`Error fetching data from geolocation API: ${geoFetch.statusText}`);
            }
            geoData = await geoFetch.json()
        }
        catch(e) {
            console.error(`An error occured: ${e}`)
        }

        let lat, lon, loc = undefined
        if(geoData) {
            lat = geoData[0].lat
            lon = geoData[0].lon
            loc = geoData[0].name
        }
        else {
            await interaction.editReply(`There was a problem, we couldn't fetch the information of the location.`)
        }

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=metric`
        let weatherData = undefined
        try {
            const weatherFetch = await fetch(weatherUrl)
            if(!weatherFetch.ok){
                throw new Error(`Error fetching data from weather API: ${weatherUrl.statusText}`);
            }
            weatherData = await weatherFetch.json()
        }
        catch(e) {
            console.error(`An error occured: ${e}`)
        }
        
        let weather, icon, curTemp, realTemp, highTemp, lowTemp, humidity, wind, id = undefined
        if(weatherData) {
            weather = weatherData.weather[0].description
            icon = weatherData.weather[0].icon
            curTemp = weatherData.main.temp
            realTemp = weatherData.main.feels_like
            highTemp = weatherData.main.temp_max
            lowTemp = weatherData.main.temp_min
            humidity = weatherData.main.humidity
            wind = weatherData.wind.speed
            id = weatherData.id
        }
        else {
            await interaction.editReply(`There was a problem, we couldn't fetch the information of the weather.`)
        }

        const weatherCond = weather.split(" ").map((word) =>
            word[0].toUpperCase() + word.substr(1)
        )
        const conditionName = weatherCond.join(" ")

        const embed = new EmbedBuilder()
            .setTitle(`Current Weather in ${loc}`)
            .setURL(`https://openweathermap.org/city/${id}`)
            .addFields(
                {
                name: "Weather Condition",
                value: `${conditionName}`,
                inline: false
                },
                {
                name: "Temperature",
                value: `${curTemp.toFixed(1)}° C`,
                inline: true
                },
                {
                name: "Feels Like",
                value: `${realTemp.toFixed(1)}° C`,
                inline: true
                },
                {
                name: "High/Low",
                value: `${highTemp.toFixed(1)}°/${lowTemp.toFixed(1)}° C`,
                inline: true
                },
                {
                name: "Humidity",
                value: `${humidity}%`,
                inline: true
                },
                {
                name: "Wind Speed",
                value: `${wind} m/s`,
                inline: true
                },
            )
            .setThumbnail(`https://openweathermap.org/img/wn/${icon}@2x.png`)
            .setColor("#00b0f4")
            .setFooter({
                text: "FeddyWeather",
                iconURL: "https://slate.dan.onl/slate.png",
            })
            .setTimestamp();

            await interaction.editReply({ content: ``, embeds: [embed] });
        }
}
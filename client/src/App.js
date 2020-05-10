import React from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import "./App.css";

class App extends React.Component {
  state = {
    dataArray: [],
    sensor1: null,
    sensor2: null,
    sensor3: null,
    sensor4: null,
    dateTime: null,
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: ["12.5 9:00"],
      },
    },
    series: [
      {
        name: "sensor 1",
        data: [30],
      },
      {
        name: "sensor 2",
        data: [10],
      },
      {
        name: "sensor 3",
        data: [105],
      },
      {
        name: "sensor 4",
        data: [100],
      },
    ],
  };

  pushDataIntoSensorData = (jsonFile) => {
    this.setState({
      dateTime: jsonFile.date,
      sensor1: jsonFile.sensor1,
      sensor2: jsonFile.sensor2,
      sensor3: jsonFile.sensor3,
      sensor4: jsonFile.sensor4,
    });
    let currentDateArray = this.state.dataArray.map((data) => data.date);
    if (
      this.state.dataArray.length < 1 ||
      !currentDateArray.includes(jsonFile.date)
    ) {
      this.saveDataToDB();
    }
    console.log(this.state.dataArray);
  };

  getDataFromSensor = () => {
    let jwtoken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJhdW5AbWV0cm9wb2xpYS5maSIsImlhdCI6MTU4ODYxMDQyM30.1z-QwqCmL3gawoxd-TPjmzk6zDkCZQqavkoUPeDulrs";
    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
      if (req.readyState === XMLHttpRequest.DONE) {
        this.pushDataIntoSensorData(JSON.parse(req.responseText));
      }
    };

    req.open("GET", "https://opendata.hopefully.works/api/events", true);
    req.setRequestHeader("Authorization", "Bearer " + jwtoken);
    req.send();
  };

  getDateTime = () => {
    let d = new Date("2020-05-09T06:00:00.000Z");
    let hours = d.getHours();
    if (hours < 10) hours = "0" + hours;
    let minutes = d.getMinutes();
    if (minutes < 10) minutes = "0" + minutes;
    let n =
      d.getDate() +
      "." +
      (d.getMonth() + 1) +
      "." +
      d.getFullYear() +
      " - " +
      hours +
      ":" +
      minutes;

    return n;
  };

  componentDidMount = async () => {
    await this.getDataFromDB();
    setInterval(() => {
      this.getDataFromSensor();
    }, 900000);
  };

  getDataFromDB = async () => {
    await axios
      .get("/api")
      .then((response) => {
        const data = response.data;
        this.setState({ dataArray: data });
        console.log("Data has been received!!");
        console.log(this.state.dataArray);
      })
      .catch(() => {
        alert("Error retrieving data!!!");
      });
  };

  saveDataToDB = () => {
    const payload = {
      date: this.state.dateTime,
      sensor1: this.state.sensor1,
      sensor2: this.state.sensor2,
      sensor3: this.state.sensor3,
      sensor4: this.state.sensor4,
    };
    axios({
      url: "/api/createData",
      method: "POST",
      data: payload,
    })
      .then(() => {
        console.log("Data has been sent to the server");
        this.getDataFromDB();
      })
      .catch(() => {
        console.log("Internal server error");
      });
  };

  render() {
    //JSX
    return (
      <div className="app">
        <div className="mixed-chart">
          <Chart
            options={this.state.options}
            series={this.state.series}
            type="line"
            width="1000"
          />
        </div>
        <button onClick={() => this.getDataFromSensor()}>Update</button>
      </div>
    );
  }
}

export default App;

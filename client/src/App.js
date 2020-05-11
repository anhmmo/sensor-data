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
    localDateTime: null,
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
        data: [0],
      },
      {
        name: "sensor 2",
        data: [0],
      },
      {
        name: "sensor 3",
        data: [0],
      },
      {
        name: "sensor 4",
        data: [0],
      },
    ],
    loading: false,
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
  };

  getDataFromSensor = () => {
    this.setState({ loading: true });
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
    setTimeout(() => {
      this.setState({ loading: false });
    }, 1500);
  };

  getDateTime = (localTime) => {
    let d = new Date(localTime);
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
    this.setState({ loading: true });
    await axios
      .get("/api")
      .then((response) => {
        const data = response.data;
        this.setState({ dataArray: data });

        if (this.state.dataArray.length > 0) {
          this.setState({
            options: {
              chart: {
                id: "basic-bar",
              },
              xaxis: {
                categories: this.state.dataArray.map(
                  (data) => data.localDateTime
                ),
              },
            },
            series: [
              {
                name: "sensor 1",
                data: this.state.dataArray.map((data) => data.sensor1),
              },
              {
                name: "sensor 2",
                data: this.state.dataArray.map((data) => data.sensor2),
              },
              {
                name: "sensor 3",
                data: this.state.dataArray.map((data) => data.sensor3),
              },
              {
                name: "sensor 4",
                data: this.state.dataArray.map((data) => data.sensor4),
              },
            ],
          });
        }
      })
      .catch(() => {
        alert("Error retrieving data!!!");
      });
    setTimeout(() => {
      this.setState({ loading: false });
    }, 1500);
  };

  saveDataToDB = () => {
    const payload = {
      date: this.state.dateTime,
      localDateTime: this.getDateTime(this.state.dateTime),
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
        {this.state.loading ? <i className="fas fa-spinner"></i> : ""}
        <div className="text-content">
          <h1>Open Data visualization</h1>

          <p>
            This is an app that, when running, fetched a new data point from an
            API provided by hopefully.works, saves it to a database and
            visualizes the data on a chart. The backend is built with Node.js +
            Express and it uses a MongoDB database. The frontend is a React app.
            The app is deployed to Heroku. Please note that the heroku app goes
            idle after 30 minutes of inactivity
          </p>
        </div>
        <div className="button-box">
          <button
            className="update-btn"
            onClick={() => this.getDataFromSensor()}
          >
            Update Data Manually
          </button>
          <button className="update-btn" onClick={() => this.getDataFromDB()}>
            Update chart
          </button>
        </div>
        <div
          className={
            this.state.loading ? "mixed-chart hide-chart" : "mixed-chart"
          }
        >
          <Chart
            options={this.state.options}
            series={this.state.series}
            type="line"
            width="100%"
          />
        </div>
      </div>
    );
  }
}

export default App;

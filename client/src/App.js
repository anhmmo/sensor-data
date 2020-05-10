import React from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import "./App.css";

class App extends React.Component {
  state = {
    id: 0,
    title: "",
    name: "",
    body: "",
    dataArray: [],
    idToDelete: 0,
    openUpdate: false,
    updateId: null,
    hasChange: false,
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: [
          "12.5 9:00",
          1992,
          1993,
          "10:00 12.5.2020  ",
          1995,
          1996,
          1997,
          1998,
          1999,
          2000,
          2001,
          2002,
          2003,
          2005,
          2007,
        ],
      },
    },
    series: [
      {
        name: "sensor 1",
        data: [30, 40, 45, 50, 49, 60, 70, 91, 88, 99, 66, 44],
      },
      {
        name: "sensor 2",
        data: [10, 30, 85, 88, null, 90, 70, 291, 346, 546, 33, 77],
      },
      {
        name: "sensor 3",
        data: [1, 20, null, null, 19, 10, 10.99, 11.66, 99, 34, 45],
      },
    ],
  };

  componentDidMount = () => {
    this.getDataFromDB();
  };

  getDataFromDB = async () => {
    await axios
      .get("/api")
      .then((response) => {
        const data = response.data;
        this.setState({ dataArray: data });
        console.log("Data has been received!!");
      })
      .catch(() => {
        alert("Error retrieving data!!!");
      });
  };

  handleChange = ({ target }) => {
    const { name, value } = target;
    this.setState({ [name]: value, hasChange: true });
  };

  openUpdateForm = (num) => {
    let currentIds = this.state.dataArray.map((data) => data.id);
    let positionOfItem = currentIds.indexOf(num);
    let items = this.state.dataArray[positionOfItem];
    this.setState({
      openUpdate: true,
      updateId: num,
      title: items.title,
      name: items.name,
      body: items.body,
    });
  };

  updateDataToDB = (event, idToUpdate) => {
    event.preventDefault();
    const { title, name, body } = this.state;
    this.state.dataArray.forEach(async (dat) => {
      if (dat.id === idToUpdate && this.state.hasChange) {
        await axios.post("/api/updateData", {
          id: dat._id,
          update: { title: title, name: name, body: body },
        });
        this.getDataFromDB();
        console.log("updated");
        this.setState({ hasChange: false });
        this.resetUserInputs();
      }
      this.setState({ openUpdate: false, updateId: null });
    });
  };

  deleteFromDB = (event, idTodelete) => {
    event.preventDefault();

    this.state.dataArray.forEach(async (item) => {
      if (item.id === idTodelete) {
        console.log(item);
        // item._id // unique id of object
        await axios.delete("/api/deleteData", {
          data: {
            id: item._id,
          },
        });

        this.getDataFromDB();
      }
    });
  };

  saveDataToDB = (event) => {
    event.preventDefault();

    let currentIds = this.state.dataArray.map((data) => data.id); //create new array with map method with id inside [1,2,3,4,5...]
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }

    const payload = {
      id: idToBeAdded,
      title: this.state.title,
      body: this.state.body,
      name: this.state.name,
    };

    this.setState({ hasChange: false });

    axios({
      url: "/api/createData",
      method: "POST",
      data: payload,
    })
      .then(() => {
        console.log("Data has been sent to the server");
        this.resetUserInputs();
        this.getDataFromDB();
      })
      .catch(() => {
        console.log("Internal server error");
      });
  };

  resetUserInputs = () => {
    this.setState({
      id: "",
      title: "",
      body: "",
      name: "",
    });
  };

  displayBlogPost = (dataArray) => {
    if (!dataArray.length) return null;

    return dataArray.map((item, index) => (
      <div key={index} className="blog-post__display">
        <h1>{item.id}</h1>
        {this.state.openUpdate && this.state.updateId === item.id ? (
          <form>
            <div className="form-input">
              <input
                type="text"
                name="title"
                value={this.state.title}
                onChange={this.handleChange}
                required
              />
            </div>
            <div className="form-input">
              <input
                type="text"
                name="name"
                value={this.state.name}
                onChange={this.handleChange}
                required
              />
            </div>
            <div className="form-input">
              <input
                type="text"
                name="body"
                value={this.state.body}
                onChange={this.handleChange}
                required
              />
            </div>
            {this.state.title.length === 0 ||
            this.state.name.length === 0 ||
            this.state.body.length === 0 ? (
              <button className="disable-btn">save</button>
            ) : (
              <button onClick={(event) => this.updateDataToDB(event, item.id)}>
                save
              </button>
            )}
            <button
              onClick={() =>
                this.setState({ openUpdate: false, updateId: null })
              }
            >
              cancel
            </button>
          </form>
        ) : (
          <div>
            <h3>
              {item.title} - {item.name}
            </h3>
            <p>{item.body}</p>
            <button onClick={(event) => this.deleteFromDB(event, item.id)}>
              delete
            </button>
            <button onClick={() => this.openUpdateForm(item.id)}>update</button>
          </div>
        )}
      </div>
    ));
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
        <h2>Welcome to the best app ever</h2>
        <form onSubmit={this.saveDataToDB}>
          <div className="form-input">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={this.state.title}
              onChange={this.handleChange}
              required
            />
          </div>
          <div className="form-input">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={this.state.name}
              onChange={this.handleChange}
              required
            />
          </div>
          <div className="form-input">
            <textarea
              placeholder="body"
              name="body"
              cols="30"
              rows="10"
              value={this.state.body}
              onChange={this.handleChange}
              required
            ></textarea>
          </div>

          <button>Submit</button>
        </form>

        <div className="blog-">
          {this.displayBlogPost(this.state.dataArray)}
        </div>
      </div>
    );
  }
}

export default App;

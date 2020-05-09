import React from "react";
import axios from "axios";

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
          <div>
            <input
              type="text"
              name="title"
              onChange={this.handleChange}
              defaultValue={this.state.title}
            />
            <input
              type="text"
              name="name"
              onChange={this.handleChange}
              defaultValue={this.state.name}
            />
            <input
              type="text"
              name="body"
              onChange={this.handleChange}
              defaultValue={this.state.body}
            />
            <button onClick={(event) => this.updateDataToDB(event, item.id)}>
              save
            </button>
            <button
              onClick={() =>
                this.setState({ openUpdate: false, updateId: null })
              }
            >
              cancel
            </button>
          </div>
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
        <h2>Welcome to the best app ever</h2>
        <form onSubmit={this.saveDataToDB}>
          <div className="form-input">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={this.state.title}
              onChange={this.handleChange}
            />
          </div>
          <div className="form-input">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={this.state.name}
              onChange={this.handleChange}
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

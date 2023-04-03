/* eslint-disable linebreak-style */
import React from 'react';
import axios from 'axios';
import { Toolbar } from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

class Video extends React.Component {
  constructor(props) {
    super(props);
    const { selectedMovie } = props;
    this.state = {
      // will referent the list of videos
      selectedMovie,
      movieName: '',
      data: false,
      thumbsUp: 0,
      thumbsDown: 0,
    };
    // this.thumbChange = this.thumbChange.bind(this)
  }
  //   const selectedMovie
  // }

  componentDidMount() {
    this.getMoviesData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedMovie !== prevProps.selectedMovie) {
      console.log('propsChanged');
      this.getMoviesData();
    }
  }

  // axios.get('/findMovies', param:{selectedMovie: props.selectedMovie} )
  // will get the list of videos from the api and then give that value to the state video key
  getMoviesData() {
    // const{ }
    const param = { selectedMovie: this.props.selectedMovie };
    console.log('reRender', this.props);
    axios.get('/findMovies', { params: param })
      .then((data) => {
        const { movieName, thumbsDown, thumbsUp } = data.data;
        if (movieName) {
          console.log('state is changed');
          this.setState({
            movieName,
            thumbsUp,
            thumbsDown,
            data: true,
          });
        } else {
          console.log('why no state change');
          this.setState({
            movieName: this.props.selectedMovie.title,
            thumbsUp: 0,
            thumbsDown: 0,
            data: false,
          });
          console.log('unsuccessful get');
        }
      })
      .catch((err) => {
        console.log('ERROR was unable to get video data:  ', err);
      });
  }

  addMovie() {
    const { movieName, thumbsUp, thumbsDown } = this.state;
    const body = { movieName, thumbsUp, thumbsDown };
    axios.post('/Movie', body)
      .then((data) => {
        console.log('line77', data);
      });
  }

  incrementMovie() {
    const { movieName, thumbsUp, thumbsDown } = this.state;
    const body = { movieName, thumbsUp, thumbsDown };
    axios.put('/Movie/UpdateThumbs/', body)
      .then((data) => {
        console.log('line77', data);
      });
  }

  // // onclick add to like or dislike
  async thumbChange(thumb) {
    const { data } = this.state;
    const count = this.state[thumb] + 1;
    await this.setState({
      [thumb]: count,
    });
    // !data ? this.addMovie() : this.incrementMovie();
    if (!data) {
      this.addMovie();
    } else {
      alert("you already like/dislike this movie , you can't like/dislike a movie more than one time");
    }
    // }
    this.incrementMovie();
  }
  // if(this.state.data === false){
  //   axios.post('/Movie', {
  //     movieName:
  //   })
  // }
  // if (opinion === 'likes') {
  // axios.put(`/Movie/UpdateThumbsUp/${id}`, {
  //   thumbsUp: value + 1,
  // })
  //   .then((data) => {
  //     if (data) {
  //       console.log('successful put');
  //     } else {
  //       console.log('unsuccessful put');
  //     }
  //   })
  //   .catch((err) => {
  //     console.log('ERROR was unable to get video data:  ', err);
  //   });
  // } else if (opinion === 'dislikes') {
  //   axios.put(`/${id}`, {
  //     thumbsDown: value + 1,
  //   })
  //     .then((data) => {
  //       if (data) {
  //         console.log('successful put');
  //       } else {
  //         console.log('unsuccessful put');
  //       }
  //     })
  //     .catch((err) => {
  //       console.log('ERROR was unable to get video data:  ', err);
  //     });
  // }

  // getOneMovie(id) {
  // }

  // () => this.thump('like', data.thumbsUp, data.id)
  // () => this.thump('dislike', data.thumbsDown, data.id)
  render() {
    const {
      movieName, thumbsUp, thumbsDown, data,
    } = this.state;
    // this.thumbs('likes', data.likes, data._id)
    // this.thumbs('dislikes', data.dislikes, data._id)

    return (
      <div className="box">
        <div>
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                  <Toolbar variant="dense">
                    <button onClick={() => this.thumbChange('thumbsUp')}><ThumbUpOffAltIcon /></button>
                    <div className="likebutton">{thumbsUp}</div>
                    <button onClick={() => this.thumbChange('thumbsDown')}><ThumbDownOffAltIcon /></button>
                    <div className="dislikebutton">{thumbsDown}</div>
                  </Toolbar>
                </AppBar>
              </Box>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

export default Video;

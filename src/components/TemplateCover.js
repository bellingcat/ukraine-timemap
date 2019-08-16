import React from 'react'
import { connect } from 'react-redux'
import { Player } from 'video-react'
import marked from 'marked'
import MediaOverlay from './Overlay/Media'

const MEDIA_HIDDEN = -2

/**
 * Manages the presentation of props that come in from the store's app.cover.
 * These are documented in docs/custom-cover.md.
 * The component is a bit of a mess, keeping a lot of internal state and using
 * a couple of weird offset calculations... but it works for the time being.
 */
class TemplateCover extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      video: MEDIA_HIDDEN,
      featureLang: 0
    }
  }

  getVideo (index, headerEndIndex) {
    if (index < headerEndIndex) {
      return this.props.cover.headerVideos[index]
    } else if (index >= 0) {
      return this.props.cover.videos[index - headerEndIndex]
    } else {
      return null
    }
  }

  onVideoClickHandler (index) {
    const buffer = this.props.cover.headerVideos ? this.props.cover.headerVideos.length : 0
    return () => {
      this.setState({
        video: index + buffer
      })
    }
  }

  renderFeature () {
    const { featureVideo } = this.props.cover
    const { featureLang } = this.state
    const { translations } = featureVideo
    const source = featureLang === 0
      ? featureVideo
      : {
        ...translations[featureLang - 1],
        poster: featureVideo.poster
      }

    return (
      <div>
        <div className='banner-trans right-overlay'>
          {translations && translations.map((trans, idx) => {
            const langIdx = idx + 1 // default lang idx is 0
            if (featureLang !== langIdx) {
              return <div onClick={() => this.setState({ featureLang: langIdx })} className='trans-button'>{trans.code}</div>
            } else {
              return <div onClick={() => this.setState({ featureLang: 0 })} className='trans-button'>ENG</div>
            }
          })}
        </div>

        <Player
          className='source-video'
          poster={source.poster}
          playsInline
          src={source.file}
        />
      </div>
    )
  }

  renderHeaderVideos () {
    const { headerVideos } = this.props.cover
    return (
      <div className='row'>
        { headerVideos.slice(0, 2).map((media, index) => (
          <div className='cell plain' onClick={() => this.setState({ video: index })}>
            {media.buttonTitle}
          </div>
        )) }
      </div>
    )
  }

  renderMediaOverlay () {
    const video = this.getVideo(this.state.video, this.props.cover.headerVideos ? this.props.cover.headerVideos.length : 0)
    return (
      <MediaOverlay
        opaque
        source={
          {
            title: video.title,
            desc: video.desc,
            paths: [video.file],
            poster: video.poster
          }}
        translations={video.translations}
        onCancel={() => this.setState({ video: MEDIA_HIDDEN })}
      />
    )
  }

  render () {
    if (!this.props.cover) {
      return (
        <div className='default-cover-container'>
          You haven't specified any cover props. Put them in the values that overwrite the store in <code>app.cover</code>
        </div>
      )
    }

    const { videos } = this.props.cover
    return (
      <div className='default-cover-container'>
        <div className='cover-content'>
          {
            this.props.cover.bgVideo ? (
              <div className={`fullscreen-bg ${!this.props.showing ? 'hidden' : ''}`}>
                <video
                  loop
                  muted
                  autoPlay
                  preload='auto'
                  className='fullscreen-bg__video'
                >
                  <source src={this.props.cover.bgVideo} type='video/mp4' />
                </video>
              </div>
            ) : null
          }
          <h1>{this.props.cover.title}</h1>
          <h3>{this.props.cover.subtitle}</h3>
          {
            this.props.cover.subsubtitle ? (
              <h5>{this.props.cover.subsubtitle}</h5>
            ) : null
          }
          <hr />

          {this.props.cover.featureVideo ? this.renderFeature() : null}
          <div className='hero thin'>
            {
              this.props.cover.headerVideos ? this.renderHeaderVideos() : null
            }
            <div className='row'>
              <div className='cell yellow' onClick={this.props.showAppHandler}>
                EXPLORE
              </div>
            </div>
          </div>

          <div className='md-container' dangerouslySetInnerHTML={{ __html: marked(this.props.cover.description) }} />

          {videos ? (
            <div className='hero'>
              <div className='row'>
                {/* NOTE: only take first four videos, drop any others for style reasons */}
                { videos && videos.slice(0, 2).map((media, index) => (
                  <div className='cell small' onClick={this.onVideoClickHandler(index)} >
                    {media.buttonTitle}<br />{media.buttonSubtitle}
                  </div>
                )) }
              </div>
              <div className='row'>
                { videos.length > 2 && this.props.cover.videos.slice(2, 4).map((media, index) => (
                  <div className='cell small' onClick={this.onVideoClickHandler(index + 2)} >
                    {media.buttonTitle}<br />{media.buttonSubtitle}
                  </div>
                )) }
              </div>
            </div>
          ) : null}
        </div>

        {
          this.state.video !== MEDIA_HIDDEN ? this.renderMediaOverlay() : null }
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    cover: state.app.cover
  }
}

export default connect(mapStateToProps)(TemplateCover)

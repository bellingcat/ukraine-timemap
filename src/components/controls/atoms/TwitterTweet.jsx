import React from 'react';
import script from 'scriptjs';
/**
 * vite changes led to this error: https://github.com/saurabhnemade/react-twitter-embed/issues/105
 * applied same solution, and dropped https://github.com/saurabhnemade/react-twitter-embed
 */

var methodName$5 = 'createTweet';
var twitterWidgetJs = 'https://platform.twitter.com/widgets.js';

const TwitterTweet = (props) => {
	var ref = React.useRef(null);

	var _React$useState = React.useState(true),
		loading = _React$useState[0],
		setLoading = _React$useState[1];

	React.useEffect(function () {
		var isComponentMounted = true;

		script(twitterWidgetJs, 'twitter-embed', function () {
			if (!window.twttr) {
				console.error('Failure to load window.twttr, aborting load');
				return;
			}

			if (isComponentMounted) {
				if (!window.twttr.widgets[methodName$5]) {
					console.error("Method " + methodName$5 + " is not present anymore in twttr.widget api");
					return;
				}

				window.twttr.widgets[methodName$5](props.tweetId, ref === null || ref === void 0 ? void 0 : ref.current, props.options).then(function (element) {
					setLoading(false);

					if (props.onLoad) {
						props.onLoad(element);
					}
				});
			}
		});
		return function () {
			isComponentMounted = false;
		};
	}, []);
	return React.createElement(React.Fragment, null, loading && React.createElement(React.Fragment, null, props.placeholder), React.createElement("div", {
		ref: ref
	}));
};
export default TwitterTweet;

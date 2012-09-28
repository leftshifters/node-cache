node-cache
==========

Cache requests and responses on your server to improve response times for testing apps

Why?

We work on a lot of apps, and many a times, the APIs rest on the clients servers and we don't have direct access to it. This means that if they don't have caching enabled, testing and debugging takes really long (of course it's also because the internet speeds in India still suck).

The aim of this package is to create a quick way to cache all get and post requests which happen on the client's server, and cache everything in memory.

It also has a few hooks to allow you to edit how the information is saved. For example, an API which gets the public feed, but still requires the userid, needs to be cached without the userid.

Also, our API is not to get it to work with the perfect API, rather, no matter how bad the API, we should be able to get this to work

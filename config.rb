
# Time.zone = "UTC"

activate :syntax,
  line_numbers: true

activate :blog do |blog|
  blog.tag_template = "tag.html"
  blog.calendar_template = "calendar.html"
  blog.summary_separator = /READMORE/

  blog.layout = "layouts/article_layout"
  #blog.summary_generator = Proc.new do |article, content|
  #  Nokogiri::HTML(content).at('p')
  #end
end

activate :drafts

page "/feed.xml", layout: false

set :css_dir, 'assets/stylesheets'
set :js_dir, 'assets/javascripts'
set :images_dir, 'assets/images'

# Build-specific configuration
configure :build do
  activate :minify_css
  activate :minify_javascript
  activate :asset_hash
  # set :http_prefix, "/Content/images/"
end

activate :deploy do |deploy|
  deploy.method = :rsync
  deploy.host   = 'danigb.com'
  deploy.path   = '/home/deployer/codingadventur.es'
  deploy.user  = 'deployer' # no default
  # deploy.port  = 5309 # ssh port, default: 22
  # deploy.clean = true # remove orphaned files on remote host, default: false
  # deploy.flags = '-rltgoDvzO --no-p --del' # add custom flags, default: -avz
end

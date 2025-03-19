import ContentfulImage from './ContentfulImage'

const Avatar = ({ name, src }: {name: string, src: string | null}) => {
  return (
    <div className='flex items-center'>
      <div className='relative w-10 h-10 mr-4'>
        <ContentfulImage
          src={src || ''}
          layout='fill'
          className='rounded-full m-0'
          alt={name}
        />
      </div>
      <div className='font-semibold'>{name}</div>
    </div>
  )
}

export default Avatar
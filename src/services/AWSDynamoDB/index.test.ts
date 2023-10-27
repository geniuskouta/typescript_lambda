import AWSDynamoDB from '.'

describe('AWSDynamoDB', () => {
  describe('generateSortKeyString', () => {
    it('Returns a sort key string with all 3 key value pairs', () => {
      const result = AWSDynamoDB.generateSortKeyString({
        ambiguity: 'none',
        batchid: '3',
        id: '18a498db0b8-7f37aa6ea1e142c1991e76bf62b698e2'
      })

      expect(result).toEqual('AMBIGUITY#noneBATCHID#3ID#18a498db0b8-7f37aa6ea1e142c1991e76bf62b698e2')
    })

    it('Returns a sort key string with a batchid missing', () => {
      const result = AWSDynamoDB.generateSortKeyString({
        ambiguity: 'none',
        batchid: ''
      })

      expect(result).toEqual('AMBIGUITY#noneBATCHID#')
    })

    it('Returns a sort key string with all values undefined', () => {
      const result = AWSDynamoDB.generateSortKeyString({
        ambiguity: undefined,
        batchid: undefined,
        id: undefined
      })

      expect(result).toEqual('AMBIGUITY')
    })

    it('Returns a sort key string with BATCHID 0', () => {
      const result = AWSDynamoDB.generateSortKeyString({
        ambiguity: 'none',
        batchid: '0'
      })

      expect(result).toEqual('AMBIGUITY#noneBATCHID#0')
    })
  })

  describe('generateSortKeyObject', () => {
    it('Returns a sort key object with all values provided', () => {
      const result = AWSDynamoDB.generateSortKeyObject(
        'AMBIGUITY#noneBATCHID#3ID#18a498db0b8-7f37aa6ea1e142c1991e76bf62b698e2',
        ['ambiguity', 'batchid', 'id']
      )
      expect(result).toEqual({
        ambiguity: 'none',
        batchid: '3',
        id: '18a498db0b8-7f37aa6ea1e142c1991e76bf62b698e2'
      })
    })

    it('Returns a sort key object with a batchid missing', () => {
      const result = AWSDynamoDB.generateSortKeyObject(
        'AMBIGUITY#noneBATCHID#ID#18a498db0b8-7f37aa6ea1e142c1991e76bf62b698e2',
        ['ambiguity', 'batchid', 'id']
      )
      expect(result).toEqual({
        ambiguity: 'none',
        batchid: '',
        id: '18a498db0b8-7f37aa6ea1e142c1991e76bf62b698e2'
      })
    })

    it('Returns a sort key object only with one key value pair', () => {
      const result = AWSDynamoDB.generateSortKeyObject(
        'AMBIGUITY#none',
        ['ambiguity']
      )
      expect(result).toEqual({
        ambiguity: 'none'
      })
    })
  })

  describe('generateUpdateOptions', () => {
    it('Returns expressionAttributeNames, expressionAttributeValues, and updateExpression based on the object given', () => {
      const result = AWSDynamoDB.generateUpdateOptions({
        assetsetId: '1234',
        sk: 'AMBIGUITY#noneBATCHID#3ID#18a498db0b8-7f37aa6ea1e142c1991e76bf62b698e2',
        ambiguity: 'none',
        id: '18a498db0b8-7f37aa6ea1e142c1991e76bf62b698e2'
      })

      expect(result).toMatchObject({
        expressionAttributeNames: {
          '#attr0': 'assetsetId',
          '#attr1': 'sk',
          '#attr2': 'ambiguity',
          '#attr3': 'id'
        },
        expressionAttributeValues: {
          ':assetsetId': '1234',
          ':sk': 'AMBIGUITY#noneBATCHID#3ID#18a498db0b8-7f37aa6ea1e142c1991e76bf62b698e2',
          ':ambiguity': 'none',
          ':id': '18a498db0b8-7f37aa6ea1e142c1991e76bf62b698e2'
        },
        updateExpression: 'SET #attr0 = :assetsetId, #attr1 = :sk, #attr2 = :ambiguity, #attr3 = :id'
      })
    })
  })
})
